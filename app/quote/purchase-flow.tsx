"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { carePlans, priceFor, type Billing, type PlanName } from "../care/care-data";
import { createStripeCheckout, sendEmailVerificationCode, verifyEmailVerificationCode } from "../lib/api-client";
import { useLocalization } from "../../components/localization-provider";
import { packages, testPackage } from "./quote-data";
import styles from "./quote.module.css";

type Package = (typeof packages)[number] | typeof testPackage;
type FixedPackage = Package & { checkoutId: string; price: string };
type PaymentPlan = "full" | "deposit" | "quarter";
type PaymentMethod = "visa" | "mastercard" | "apple-pay" | "google-pay" | "paypal" | "klarna";
type Step = "review" | "details" | "email" | "choice" | "method" | "processing" | "success" | "care" | "final" | "error";

type ProjectDetails = {
  projectName: string;
  business: string;
  websiteType: string;
  pages: string;
  style: string;
  domain: string;
  logo: string;
  notes: string;
  selectedFeatures: string[];
};

type PurchaseCheckoutProps = {
  selectedPackage: FixedPackage | null;
  onClose: () => void;
};

const methodLabels: Record<PaymentMethod, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  "apple-pay": "Apple Pay",
  "google-pay": "Google Pay",
  paypal: "PayPal",
  klarna: "Klarna",
};

function PaymentBrand({ method }: { method: PaymentMethod }) {
  if (method === "paypal") return <span className={`${styles.paymentBrand} ${styles.paypalBrand}`} aria-hidden="true">PayPal</span>;
  const asset = method === "visa" ? "/images/footer/visa.png" : method === "mastercard" ? "/images/footer/mastercard.svg" : method === "apple-pay" ? "/images/footer/apple-pay.svg" : method === "google-pay" ? "/images/footer/google-pay.svg" : "/images/footer/klarna.svg";
  return <span className={`${styles.paymentBrand} ${method === "klarna" ? styles.klarnaBrand : ""}`} aria-hidden="true"><Image src={asset} width={method === "mastercard" ? 58 : 72} height={34} alt="" /></span>;
}

function detectCardBrand(value: string): "visa" | "mastercard" {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("5") || /^2[2-7]/.test(digits)) return "mastercard";
  return "visa";
}

const featureChips = ["Contact Form", "Booking", "Online Store", "Gallery", "Blog", "Payments", "Maps", "Social Media", "Newsletter", "Other"];

function parseSekOre(price: string) {
  const match = price.match(/([\d\s,]+)\s*SEK/i);
  if (!match) return null;
  return Number(match[1].replace(/[^\d]/g, "")) * 100;
}

function formatSekOre(amountOre: number) {
  const amount = amountOre / 100;
  const hasOre = amountOre % 100 !== 0;
  return `${new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: hasOre ? 2 : 0,
    maximumFractionDigits: hasOre ? 2 : 0,
  }).format(amount)} SEK`;
}

function createCheckoutAttemptId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function temporaryOrderNumber(packageId: string) {
  const seed = Array.from(packageId).reduce((total, char) => total + char.charCodeAt(0), 0);
  return `#${512 + (seed % 81)}`;
}

function Progress({ step }: { step: Step }) {
  const active = step === "review" ? 0 : step === "details" || step === "email" ? 1 : step === "choice" || step === "method" || step === "processing" || step === "error" ? 2 : 3;
  return (
    <ol className={styles.checkoutProgress} aria-label="Checkout progress">
      {["Package", "Details", "Payment", "Confirm"].map((label, index) => <li key={label} data-active={index <= active}>{label}</li>)}
    </ol>
  );
}

function Spinner() {
  return <span className={styles.checkoutSpinner} aria-hidden="true" />;
}

function SuccessMark() {
  return (
    <svg className={styles.successMark} viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <circle cx="40" cy="40" r="34" />
      <path d="m24 42 11 11 22-26" />
    </svg>
  );
}

export default function PurchaseFlow({ selectedPackage, onClose }: PurchaseCheckoutProps) {
  const { locale } = useLocalization();
  const [step, setStep] = useState<Step>("review");
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("full");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [processingText, setProcessingText] = useState("Processing payment...");
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({ projectName: "", business: "", websiteType: "", pages: "", style: "", domain: "", logo: "", notes: "", selectedFeatures: [] });
  const [customerEmail, setCustomerEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [checkoutAttemptId, setCheckoutAttemptId] = useState(createCheckoutAttemptId);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(59);
  const [careBilling, setCareBilling] = useState<Billing>("Monthly");
  const [carePlan, setCarePlan] = useState<PlanName | "">("");
  const closeRef = useRef<HTMLButtonElement>(null);

  const totalOre = useMemo(() => parseSekOre(selectedPackage?.price ?? ""), [selectedPackage]);
  const demoOrderNumber = useMemo(() => selectedPackage ? temporaryOrderNumber(selectedPackage.checkoutId) : "#512", [selectedPackage]);
  const payNowOre = totalOre ? paymentPlan === "quarter" ? Math.round(totalOre / 4) : paymentPlan === "deposit" ? Math.round(totalOre / 2) : totalOre : 0;
  const remainingOre = totalOre ? totalOre - payNowOre : 0;
  const selectedCarePlan = carePlans.find(item => item.name === carePlan);
  const isTestPackage = selectedPackage?.checkoutId === "bluemind-test-package";
  const isFrontendPreviewPackage = Boolean(selectedPackage && "frontendPreview" in selectedPackage && selectedPackage.frontendPreview);
  const supportsQuarterPayment = selectedPackage?.checkoutId === "online-store-advanced";

  useEffect(() => {
    if (!selectedPackage) return;
    setStep("review");
    setPaymentPlan("full");
    setPaymentMethod("visa");
    setCardNumber("");
    setCheckoutError("");
    setProcessingText("Processing payment...");
    setProjectDetails({ projectName: "", business: "", websiteType: "", pages: "", style: "", domain: "", logo: "", notes: "", selectedFeatures: [] });
    setCustomerEmail("");
    setEmailSent(false);
    setEmailVerified(false);
    setCheckoutAttemptId(createCheckoutAttemptId());
    setEmailVerificationToken("");
    setSendingCode(false);
    setVerifyingCode(false);
    setCode("");
    setCodeError("");
    setResendSeconds(59);
    setCareBilling("Monthly");
    setCarePlan("");
    window.setTimeout(() => closeRef.current?.focus(), 0);
  }, [selectedPackage]);

  useEffect(() => {
    if (!selectedPackage) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
    };
  }, [onClose, selectedPackage]);

  useEffect(() => {
    if (!emailSent || emailVerified || resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds(current => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [emailSent, emailVerified, resendSeconds]);

  if (!selectedPackage || totalOre === null) return null;

  function toggleFeature(feature: string) {
    setProjectDetails(current => ({
      ...current,
      selectedFeatures: current.selectedFeatures.includes(feature) ? current.selectedFeatures.filter(item => item !== feature) : [...current.selectedFeatures, feature],
    }));
  }

  function updateDetail(field: keyof Omit<ProjectDetails, "selectedFeatures">, value: string) {
    setProjectDetails(current => ({ ...current, [field]: value }));
  }

  function submitProjectDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("email");
  }

  async function sendCode() {
    const email = customerEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCodeError("Please enter a valid email address.");
      return;
    }
    if (emailSent && resendSeconds > 0) return;
    setSendingCode(true);
    setEmailVerified(false);
    setEmailVerificationToken("");
    setCode("");
    setCodeError("");
    const result = await sendEmailVerificationCode({ email, checkoutAttemptId, language: locale });
    setSendingCode(false);
    if (!result.success) {
      setCodeError(result.error);
      return;
    }
    setCustomerEmail(result.verification.email);
    setCheckoutAttemptId(result.verification.checkoutAttemptId);
    setEmailSent(true);
    setResendSeconds(result.verification.resendAfterSeconds || 59);
  }

  async function verifyCode() {
    setVerifyingCode(true);
    setCodeError("");
    const result = await verifyEmailVerificationCode({ email: customerEmail.trim().toLowerCase(), checkoutAttemptId, code });
    setVerifyingCode(false);
    if (!result.success) {
      setCodeError(result.error);
      return;
    }
    setCustomerEmail(result.verification.email);
    setCheckoutAttemptId(result.verification.checkoutAttemptId);
    setEmailVerificationToken(result.verification.verificationToken);
    setEmailVerified(true);
    window.setTimeout(() => setStep("choice"), 650);
  }

  function simulatePayment(fail = false, nextStep: Step = "success") {
    setStep("processing");
    setProcessingText("Processing payment...");
    window.setTimeout(() => {
      if (fail) {
        setStep("error");
        return;
      }
      setProcessingText(nextStep === "care" ? "Activating BlueMind Care..." : "Preparing your order...");
      window.setTimeout(() => setStep(nextStep), 1300);
    }, 1500);
  }

  async function startStripeCheckout() {
    if (!selectedPackage) return;
    if (isFrontendPreviewPackage) {
      simulatePayment(false, "success");
      return;
    }
    if (paymentPlan === "quarter") {
      setCheckoutError("This payment option is a frontend preview only until backend support is added.");
      setStep("error");
      return;
    }
    if (!emailVerified || !emailVerificationToken) {
      setCodeError("Please verify your email before continuing to payment.");
      setStep("email");
      return;
    }
    setCheckoutError("");
    setProcessingText("Opening secure Stripe Checkout...");
    const backendPaymentPlan: "full" | "deposit" = paymentPlan;
    const result = await createStripeCheckout({
      packageId: selectedPackage.checkoutId,
      paymentOption: backendPaymentPlan,
      customerName: projectDetails.projectName || customerEmail,
      verifiedEmail: customerEmail,
      checkoutAttemptId,
      emailVerificationToken,
      projectDescription: [
        projectDetails.notes,
        projectDetails.business ? `Business: ${projectDetails.business}` : "",
        projectDetails.websiteType ? `Website type: ${projectDetails.websiteType}` : "",
        projectDetails.pages ? `Pages: ${projectDetails.pages}` : "",
        projectDetails.style ? `Style: ${projectDetails.style}` : "",
      ].filter(Boolean).join("\n\n"),
      requestedFeatures: projectDetails.selectedFeatures,
      customerLanguage: locale,
      websiteDetails: {
        businessName: projectDetails.projectName,
        businessDescription: projectDetails.business,
        websiteType: projectDetails.websiteType,
        pagesNeeded: projectDetails.pages,
        preferredStyle: projectDetails.style,
        domainStatus: projectDetails.domain,
        logoStatus: projectDetails.logo,
        additionalNotes: projectDetails.notes,
      },
    });

    if (!result.success) {
      setCheckoutError(result.error);
      setStep("error");
      return;
    }
    window.location.assign(result.checkout.checkoutUrl);
  }

  const paymentSummary = (
    <dl className={styles.paymentSummary}>
      <div><dt>Package</dt><dd>{selectedPackage.title}</dd></div>
      <div><dt>Total</dt><dd>{formatSekOre(totalOre)}</dd></div>
      <div><dt>Pay now</dt><dd>{formatSekOre(payNowOre)}</dd></div>
      <div><dt>{paymentPlan === "full" ? "Remaining" : "Remaining before delivery"}</dt><dd>{formatSekOre(remainingOre)}</dd></div>
    </dl>
  );

  return (
    <div className={styles.checkoutBackdrop} role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget && (step === "review" || step === "details" || step === "email")) onClose();
    }}>
      <div className={styles.checkoutModal} role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button ref={closeRef} type="button" className={styles.checkoutClose} aria-label="Close checkout" onClick={onClose}>X</button>
        <Progress step={step} />
        <div className={styles.checkoutStep} data-step={step}>
          {step === "review" && (
            <>
              <p className={styles.checkoutEyebrow}>Review package</p>
              <h2 id="checkout-title">{selectedPackage.title}</h2>
              <p className={styles.checkoutLead}>{selectedPackage.description}</p>
              <div className={styles.reviewCard}>
                <div><span>Price</span><strong>{formatSekOre(totalOre)}</strong></div>
                <div><span>Delivery</span><strong>{selectedPackage.delivery.replace("Estimated delivery: ", "")}</strong></div>
                <div><span>Responsive</span><strong>Desktop / Tablet / Mobile</strong></div>
                {selectedPackage.scope && <div><span>Pages</span><strong>{selectedPackage.scope}</strong></div>}
              </div>
              <ul className={styles.checkoutFeatures}>{selectedPackage.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
              <button type="button" className={styles.checkoutPrimary} onClick={() => setStep("details")}>Continue</button>
            </>
          )}

          {step === "details" && (
            <form className={styles.projectDetails} onSubmit={submitProjectDetails}>
              <p className={styles.checkoutEyebrow}>Project details</p>
              <h2 id="checkout-title">Tell us about your project</h2>
              <p className={styles.checkoutLead}>Share the essentials now. We will refine everything with you after your order is created.</p>
              <div className={styles.detailsFields}>
                <label>Project / Business Name<input value={projectDetails.projectName} onChange={event => updateDetail("projectName", event.target.value)} /></label>
                <label>What does your business do?<textarea rows={3} value={projectDetails.business} onChange={event => updateDetail("business", event.target.value)} /></label>
                <div className={styles.detailGrid}>
                  <label>What type of website do you want?<input value={projectDetails.websiteType} onChange={event => updateDetail("websiteType", event.target.value)} /></label>
                  <label>Pages you need<input placeholder="Home, About, Services..." value={projectDetails.pages} onChange={event => updateDetail("pages", event.target.value)} /></label>
                </div>
                <fieldset className={styles.featureChips}>
                  <legend>Features you need</legend>
                  {featureChips.map(feature => <button key={feature} type="button" data-selected={projectDetails.selectedFeatures.includes(feature)} onClick={() => toggleFeature(feature)}>{feature}</button>)}
                </fieldset>
                <div className={styles.detailGrid}>
                  <label>Preferred style / colors<input value={projectDetails.style} onChange={event => updateDetail("style", event.target.value)} /></label>
                  <label>Do you already have a domain?<select value={projectDetails.domain} onChange={event => updateDetail("domain", event.target.value)}><option value="">Select</option><option>Yes</option><option>No</option><option>Not sure</option></select></label>
                  <label>Do you already have a logo?<select value={projectDetails.logo} onChange={event => updateDetail("logo", event.target.value)}><option value="">Select</option><option>Yes</option><option>No</option><option>Need help</option></select></label>
                </div>
                <label>Tell us about your project<textarea rows={6} value={projectDetails.notes} onChange={event => updateDetail("notes", event.target.value)} /></label>
              </div>
              <button type="submit" className={styles.checkoutPrimary}>Continue to Email Verification</button>
            </form>
          )}

          {step === "email" && (
            <>
              <p className={styles.checkoutEyebrow}>Email verification</p>
              <h2 id="checkout-title">Verify your order email</h2>
              <p className={styles.checkoutLead}>This verified email will be linked to your order, payment confirmation, project summary, and future BlueMind Care validation.</p>
              <div className={styles.emailVerify}>
                <label>Email Address<input type="email" value={customerEmail} onChange={event => { setCustomerEmail(event.target.value); setCodeError(""); setEmailSent(false); setEmailVerified(false); setEmailVerificationToken(""); setCode(""); setResendSeconds(0); }} required /></label>
                <button type="button" className={styles.checkoutPrimary} onClick={sendCode} disabled={sendingCode || (emailSent && resendSeconds > 0)}>{sendingCode ? "Sending..." : emailSent ? "Send verification code again" : "Send verification code"}</button>
                {emailSent && (
                  <div className={styles.verifyPanel}>
                    <label>Enter the 6-digit code we sent to your email.<input inputMode="numeric" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" /></label>
                    <div className={styles.verifyActions}>
                      <button type="button" className={styles.checkoutPrimary} onClick={verifyCode} disabled={verifyingCode || code.length !== 6}>{verifyingCode ? "Verifying..." : "Verify Email"}</button>
                      {resendSeconds > 0 ? <span>Resend code in {resendSeconds}s</span> : <button type="button" className={styles.checkoutGhost} onClick={sendCode} disabled={sendingCode}>{sendingCode ? "Sending..." : "Resend Code"}</button>}
                    </div>
                    {codeError && <p className={styles.verifyError}>{codeError}</p>}
                    {emailVerified && <p className={styles.verifySuccess}><SuccessMark /> Email verified</p>}
                  </div>
                )}
              </div>
            </>
          )}

          {step === "choice" && (
            <>
              <p className={styles.checkoutEyebrow}>Payment choice</p>
              <h2 id="checkout-title">How would you like to pay?</h2>
              <div className={styles.planGrid} data-single={isTestPackage ? "true" : undefined}>
                <button type="button" data-selected={paymentPlan === "full"} onClick={() => setPaymentPlan("full")}><span>Pay in Full</span><strong>{formatSekOre(totalOre)}</strong><small>No remaining balance.</small></button>
                {!isTestPackage && <button type="button" data-selected={paymentPlan === "deposit"} onClick={() => setPaymentPlan("deposit")}><span>Pay 50% Now</span><strong>{formatSekOre(Math.round(totalOre / 2))}</strong><small>Pay the remaining {formatSekOre(totalOre - Math.round(totalOre / 2))} according to the agreed delivery terms.</small></button>}
                {supportsQuarterPayment && <button type="button" data-selected={paymentPlan === "quarter"} onClick={() => setPaymentPlan("quarter")}><span>Pay 25% Now</span><strong>{formatSekOre(Math.round(totalOre / 4))}</strong><small>Remaining balance: {formatSekOre(totalOre - Math.round(totalOre / 4))}. Paid later according to the agreed delivery terms.</small></button>}
              </div>
              {isTestPackage && <p className={styles.demoNotice}>Sandbox Test Only - No real payment will be charged. This package uses full payment only.</p>}
              {isFrontendPreviewPackage && <p className={styles.demoNotice}>Frontend preview only. This e-commerce package is not connected to Stripe yet, so no real checkout session or payment is created today.</p>}
              {paymentSummary}
              <button type="button" className={styles.checkoutPrimary} onClick={() => setStep("method")}>Continue to Payment</button>
            </>
          )}

          {step === "method" && (
            <>
              <p className={styles.checkoutEyebrow}>{isFrontendPreviewPackage ? "Frontend checkout preview" : "Stripe Sandbox Checkout"}</p>
              <h2 id="checkout-title">Choose payment method</h2>
              <p className={styles.demoNotice}>{isFrontendPreviewPackage ? "This is a visual payment preview for the new e-commerce package. Backend pricing and Stripe support will be added in the next phase." : "You will continue to secure Stripe Checkout in test mode. BlueMind never receives or stores card numbers or CVC."}</p>
              <div className={styles.methodGrid}>{(Object.keys(methodLabels) as PaymentMethod[]).map(method => <button key={method} type="button" disabled={method === "klarna"} data-method={method} data-selected={paymentMethod === method} onClick={() => setPaymentMethod(method)}><PaymentBrand method={method} /><span>{methodLabels[method]}</span>{method === "klarna" && <small>Coming Soon</small>}</button>)}</div>
              {(paymentMethod === "visa" || paymentMethod === "mastercard") && <div className={styles.walletDemo}>Card payment will be completed securely on Stripe.</div>}
              {paymentMethod === "apple-pay" && <div className={styles.walletDemo}>Apple Pay availability is handled by Stripe Checkout.</div>}
              {paymentMethod === "google-pay" && <div className={styles.walletDemo}>Google Pay availability is handled by Stripe Checkout.</div>}
              {paymentMethod === "paypal" && <div className={styles.walletDemo}>PayPal is planned. Continue with Stripe card checkout for this test payment.</div>}
              {paymentSummary}
              <div className={styles.checkoutActions}>
                <button type="button" className={styles.checkoutPrimary} disabled={paymentMethod === "klarna"} onClick={startStripeCheckout}>{paymentPlan === "full" ? `Pay ${formatSekOre(payNowOre)}` : `Pay ${formatSekOre(payNowOre)} now`}</button>
              </div>
            </>
          )}

          {step === "processing" && <div className={styles.processingState}><Spinner /><h2 id="checkout-title">{processingText}</h2><p>Please keep this window open.</p></div>}

          {step === "success" && (
            <div className={styles.successState}>
              <SuccessMark />
              <h2 id="checkout-title">Payment successful</h2>
              <p>Your order is ready.</p>
              <div className={styles.orderNumber}><span>Your Order Number</span><strong>{demoOrderNumber}</strong></div>
              <p className={styles.demoNotice}>Save this number. You will need it for BlueMind Care and future order support. This is a frontend-only demo order number.</p>
              <div className={styles.emailPreview}><span>Confirmation sent to:</span><strong>{customerEmail}</strong><small>Tomorrow the backend will send the real confirmation email with the order number, package, payment, remaining balance, and project summary.</small></div>
              <section className={styles.careUpsell} aria-labelledby="care-upsell-title">
                <h3 id="care-upsell-title">Keep your website running smoothly with BlueMind Care.</h3>
                <div>{carePlans.map(plan => <button key={plan.id} type="button" onClick={() => { setCarePlan(plan.name); setStep("care"); }}><span>{plan.name}</span><strong>{priceFor(plan, "Monthly")} / month</strong></button>)}</div>
                <Link href="/care" className={styles.checkoutGhost}>Learn More</Link>
              </section>
              <button type="button" className={styles.checkoutPrimary} onClick={() => setStep("final")}>Continue</button>
            </div>
          )}

          {step === "care" && selectedCarePlan && (
            <div>
              <p className={styles.checkoutEyebrow}>BlueMind Care</p>
              <h2 id="checkout-title">Activate {selectedCarePlan.name}</h2>
              <p className={styles.checkoutLead}>Connected to order {demoOrderNumber} and {customerEmail}.</p>
              <fieldset className={styles.billingMini}><legend>Billing</legend>{(["Monthly", "Yearly"] as const).map(cycle => <button key={cycle} type="button" data-selected={careBilling === cycle} onClick={() => setCareBilling(cycle)}>{cycle}<span>{priceFor(selectedCarePlan, cycle)}</span></button>)}</fieldset>
              <div className={styles.walletDemo}>{selectedCarePlan.name} · {careBilling} · {priceFor(selectedCarePlan, careBilling)}</div>
              <div className={styles.checkoutActions}><button type="button" className={styles.checkoutPrimary} onClick={() => simulatePayment(false, "final")}>Activate BlueMind Care</button><button type="button" className={styles.checkoutGhost} onClick={() => setStep("final")}>Skip Care for now</button></div>
            </div>
          )}

          {step === "final" && (
            <div className={styles.successState}>
              <SuccessMark />
              <h2 id="checkout-title">Thank you.</h2>
              <p>We received your order details.</p>
              <div className={styles.orderNumber}><span>Order</span><strong>{demoOrderNumber}</strong></div>
              <p>Our team will contact you shortly to begin your project.</p>
              {carePlan && selectedCarePlan ? <p className={styles.demoNotice}>BlueMind Care selected: {selectedCarePlan.name} · {careBilling}. Tomorrow this will become a real subscription after backend/Stripe connection.</p> : null}
              <p className={styles.demoNotice}>{paymentPlan === "quarter" ? "25% paid. Remaining balance due according to the agreed delivery terms." : paymentPlan === "deposit" ? "50% paid. Remaining balance due according to the agreed delivery terms." : "Paid in full."}</p>
              <button type="button" className={styles.checkoutPrimary} onClick={onClose}>Done</button>
            </div>
          )}

          {step === "error" && <div className={styles.errorState}><span aria-hidden="true">!</span><h2 id="checkout-title">Payment couldn&apos;t be completed.</h2><p>{checkoutError || "Please check your payment details and try again."}</p><button type="button" className={styles.checkoutPrimary} onClick={() => setStep("method")}>Try Again</button></div>}
        </div>
      </div>
    </div>
  );
}
