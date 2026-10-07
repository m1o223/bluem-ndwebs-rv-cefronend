"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { packages } from "./quote-data";
import styles from "./quote.module.css";

type Package = (typeof packages)[number];
type FixedPackage = Package & { price: `From ${string} SEK` };
type PaymentPlan = "full" | "deposit";
type PaymentMethod = "visa" | "mastercard" | "apple-pay" | "google-pay" | "paypal" | "klarna";
type Step = "review" | "choice" | "method" | "processing" | "success" | "details" | "final" | "error";

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

const featureChips = ["Contact Form", "Booking", "Online Store", "Gallery", "Blog", "Login / Accounts", "Payments", "Maps", "Social Media", "Newsletter", "Other"];

function parseSek(price: string) {
  const match = price.match(/([\d\s,]+)\s*SEK/i);
  if (!match) return null;
  return Number(match[1].replace(/[^\d]/g, ""));
}

function formatSek(amount: number) {
  return `${new Intl.NumberFormat("sv-SE").format(amount)} SEK`;
}

function temporaryOrderNumber(packageId: string) {
  const seed = Array.from(packageId).reduce((total, char) => total + char.charCodeAt(0), 0);
  return `#${512 + (seed % 81)}`;
}

function paymentAmountLabel(plan: PaymentPlan, payNow: number) {
  return plan === "deposit" ? `Pay ${formatSek(payNow)} now` : `Pay ${formatSek(payNow)}`;
}

function Progress({ step }: { step: Step }) {
  const active = step === "review" ? 0 : step === "choice" || step === "method" || step === "processing" || step === "error" ? 1 : step === "success" ? 2 : step === "details" || step === "final" ? 3 : 0;
  return (
    <ol className={styles.checkoutProgress} aria-label="Checkout progress">
      {["Package", "Payment", "Order", "Details"].map((label, index) => (
        <li key={label} data-active={index <= active}>{label}</li>
      ))}
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

export default function PurchaseCheckout({ selectedPackage, onClose }: PurchaseCheckoutProps) {
  const [step, setStep] = useState<Step>("review");
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("full");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("visa");
  const [processingText, setProcessingText] = useState("Processing payment...");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const total = useMemo(() => parseSek(selectedPackage?.price ?? ""), [selectedPackage]);
  const demoOrderNumber = useMemo(() => selectedPackage ? temporaryOrderNumber(selectedPackage.checkoutId) : "#512", [selectedPackage]);
  const payNow = total ? paymentPlan === "deposit" ? total / 2 : total : 0;
  const remaining = total ? total - payNow : 0;
  const canPay = paymentMethod !== "klarna";

  useEffect(() => {
    if (!selectedPackage) return;
    setStep("review");
    setPaymentPlan("full");
    setPaymentMethod("visa");
    setProcessingText("Processing payment...");
    setSelectedFeatures([]);
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

  if (!selectedPackage || total === null) return null;

  function simulatePayment(fail = false) {
    setStep("processing");
    setProcessingText("Processing payment...");
    window.setTimeout(() => {
      if (fail) {
        setStep("error");
        return;
      }
      setProcessingText("Preparing your order...");
      window.setTimeout(() => setStep("success"), 1300);
    }, 1500);
  }

  function sendDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("processing");
    setProcessingText("Sending your project details...");
    window.setTimeout(() => setStep("final"), 1200);
  }

  function toggleFeature(feature: string) {
    setSelectedFeatures(current => current.includes(feature) ? current.filter(item => item !== feature) : [...current, feature]);
  }

  const paymentSummary = (
    <dl className={styles.paymentSummary}>
      <div><dt>Package</dt><dd>{selectedPackage.title}</dd></div>
      <div><dt>Total</dt><dd>{formatSek(total)}</dd></div>
      <div><dt>Pay now</dt><dd>{formatSek(payNow)}</dd></div>
      <div><dt>{paymentPlan === "deposit" ? "Remaining before delivery" : "Remaining"}</dt><dd>{formatSek(remaining)}</dd></div>
    </dl>
  );

  return (
    <div className={styles.checkoutBackdrop} role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget && (step === "review" || step === "choice")) onClose();
    }}>
      <div className={styles.checkoutModal} role="dialog" aria-modal="true" aria-labelledby="checkout-title" ref={dialogRef}>
        <button ref={closeRef} type="button" className={styles.checkoutClose} aria-label="Close checkout" onClick={onClose}>X</button>
        <Progress step={step} />
        <div className={styles.checkoutStep} data-step={step}>
          {step === "review" && (
            <>
              <p className={styles.checkoutEyebrow}>Review package</p>
              <h2 id="checkout-title">{selectedPackage.title}</h2>
              <p className={styles.checkoutLead}>{selectedPackage.description}</p>
              <div className={styles.reviewCard}>
                <div><span>Price</span><strong>{formatSek(total)}</strong></div>
                <div><span>Delivery</span><strong>{selectedPackage.delivery.replace("Estimated delivery: ", "")}</strong></div>
                <div><span>Responsive</span><strong>Desktop / Tablet / Mobile</strong></div>
                {selectedPackage.scope && <div><span>Pages</span><strong>{selectedPackage.scope}</strong></div>}
              </div>
              <ul className={styles.checkoutFeatures}>{selectedPackage.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
              <button type="button" className={styles.checkoutPrimary} onClick={() => setStep("choice")}>Continue</button>
            </>
          )}

          {step === "choice" && (
            <>
              <p className={styles.checkoutEyebrow}>Payment choice</p>
              <h2 id="checkout-title">How would you like to pay?</h2>
              <div className={styles.planGrid}>
                <button type="button" data-selected={paymentPlan === "full"} onClick={() => setPaymentPlan("full")}>
                  <span>Pay in Full</span>
                  <strong>{formatSek(total)}</strong>
                  <small>No remaining balance.</small>
                </button>
                <button type="button" data-selected={paymentPlan === "deposit"} onClick={() => setPaymentPlan("deposit")}>
                  <span>Pay 50% Now</span>
                  <strong>{formatSek(total / 2)}</strong>
                  <small>{formatSek(total / 2)} remaining before final delivery.</small>
                </button>
              </div>
              {paymentSummary}
              <button type="button" className={styles.checkoutPrimary} onClick={() => setStep("method")}>Continue to Payment</button>
            </>
          )}

          {step === "method" && (
            <>
              <p className={styles.checkoutEyebrow}>Frontend payment simulation</p>
              <h2 id="checkout-title">Choose payment method</h2>
              <p className={styles.demoNotice}>Demo only. No real payment is processed, and card details are not sent or stored.</p>
              <div className={styles.methodGrid}>
                {(Object.keys(methodLabels) as PaymentMethod[]).map(method => (
                  <button key={method} type="button" disabled={method === "klarna"} data-selected={paymentMethod === method} onClick={() => setPaymentMethod(method)}>
                    <span>{methodLabels[method]}</span>
                    {method === "klarna" && <small>Coming Soon</small>}
                  </button>
                ))}
              </div>
              {(paymentMethod === "visa" || paymentMethod === "mastercard") && (
                <div className={styles.cardDemo} aria-label="Demo card fields">
                  <label>Cardholder name<input type="text" placeholder="Name on card" autoComplete="off" /></label>
                  <label>Card number<input type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" autoComplete="off" /></label>
                  <div>
                    <label>Expiry date<input type="text" placeholder="MM / YY" autoComplete="off" /></label>
                    <label>CVC<input type="text" inputMode="numeric" placeholder="CVC" autoComplete="off" /></label>
                  </div>
                </div>
              )}
              {paymentMethod === "apple-pay" && <div className={styles.walletDemo}>Apple Pay confirmation ready</div>}
              {paymentMethod === "google-pay" && <div className={styles.walletDemo}>Google Pay confirmation ready</div>}
              {paymentMethod === "paypal" && <div className={styles.walletDemo}>Continue with PayPal</div>}
              {paymentSummary}
              <div className={styles.checkoutActions}>
                <button type="button" className={styles.checkoutPrimary} disabled={!canPay} onClick={() => simulatePayment(false)}>{paymentAmountLabel(paymentPlan, payNow)}</button>
                <button type="button" className={styles.checkoutGhost} onClick={() => simulatePayment(true)}>Test error state</button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className={styles.processingState}>
              <Spinner />
              <h2 id="checkout-title">{processingText}</h2>
              <p>Please keep this window open.</p>
            </div>
          )}

          {step === "success" && (
            <div className={styles.successState}>
              <SuccessMark />
              <h2 id="checkout-title">Payment successful</h2>
              <p>Your order is ready.</p>
              <div className={styles.orderNumber}><span>Your Order Number</span><strong>{demoOrderNumber}</strong></div>
              <p className={styles.demoNotice}>Save this number. You can use it when contacting BlueMind about your project. This is a frontend-only demo order number.</p>
              <button type="button" className={styles.checkoutPrimary} onClick={() => setStep("details")}>Add Project Details</button>
            </div>
          )}

          {step === "details" && (
            <form className={styles.projectDetails} onSubmit={sendDetails}>
              <p className={styles.checkoutEyebrow}>Project details</p>
              <h2 id="checkout-title">Tell us about your project</h2>
              <p className={styles.checkoutLead}>The more details you give us, the faster we can start.</p>
              <div className={styles.detailsLayout}>
                <div className={styles.detailsFields}>
                  <label>Project / Business Name<input name="projectName" /></label>
                  <label>What does your business do?<textarea name="business" rows={3} /></label>
                  <label>What type of website do you want?<input name="websiteType" /></label>
                  <label>Pages you need<input name="pages" placeholder="Home, About, Services, Contact..." /></label>
                  <label>Preferred colors / style<input name="style" /></label>
                  <div className={styles.detailGrid}>
                    <label>Do you already have a domain?<select name="domain" defaultValue=""><option value="">Select</option><option>Yes</option><option>No</option><option>Not sure</option></select></label>
                    <label>Do you have a logo?<select name="logo" defaultValue=""><option value="">Select</option><option>Yes</option><option>No</option><option>Need help</option></select></label>
                    <label>Do you already have text/content?<select name="content" defaultValue=""><option value="">Select</option><option>Yes</option><option>No</option><option>Partly</option></select></label>
                  </div>
                  <fieldset className={styles.featureChips}>
                    <legend>Features you need</legend>
                    {featureChips.map(feature => <button key={feature} type="button" data-selected={selectedFeatures.includes(feature)} onClick={() => toggleFeature(feature)}>{feature}</button>)}
                  </fieldset>
                  <label>Tell us everything you want us to know about your website.<textarea name="notes" rows={6} /></label>
                  <label>Additional notes<input name="additionalNotes" /></label>
                </div>
                <aside className={styles.detailsSummary}>
                  <h3>Order summary</h3>
                  <dl>
                    <div><dt>Order</dt><dd>{demoOrderNumber}</dd></div>
                    <div><dt>Package</dt><dd>{selectedPackage.title}</dd></div>
                    <div><dt>Payment method</dt><dd>{methodLabels[paymentMethod]}</dd></div>
                    <div><dt>Total</dt><dd>{formatSek(total)}</dd></div>
                    <div><dt>Paid now</dt><dd>{formatSek(payNow)}</dd></div>
                    <div><dt>Remaining</dt><dd>{formatSek(remaining)}</dd></div>
                  </dl>
                </aside>
              </div>
              <button type="submit" className={styles.checkoutPrimary}>Send Project Details</button>
            </form>
          )}

          {step === "final" && (
            <div className={styles.successState}>
              <SuccessMark />
              <h2 id="checkout-title">Thank you.</h2>
              <p>We received your project details.</p>
              <div className={styles.orderNumber}><span>Order</span><strong>{demoOrderNumber}</strong></div>
              <p>Our team will contact you shortly to begin your project.</p>
              <p className={styles.demoNotice}>{paymentPlan === "deposit" ? "50% paid. 50% due before final delivery." : "Paid in full."}</p>
              <button type="button" className={styles.checkoutPrimary} onClick={onClose}>Done</button>
            </div>
          )}

          {step === "error" && (
            <div className={styles.errorState}>
              <span aria-hidden="true">!</span>
              <h2 id="checkout-title">Payment couldn&apos;t be completed.</h2>
              <p>Please check your payment details and try again. This is a frontend demo error state.</p>
              <button type="button" className={styles.checkoutPrimary} onClick={() => setStep("method")}>Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
