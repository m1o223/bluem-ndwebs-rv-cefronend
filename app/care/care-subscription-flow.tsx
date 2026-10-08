"use client";

import { useEffect, useMemo, useState } from "react";
import { StarMark } from "../../components/star-mark";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import {
  cancelCareSubscription,
  createCareStripeCheckout,
  getCareCheckoutStatus,
  loadCareSubscriptions,
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
  type CareSubscription,
} from "../lib/api-client";
import { carePlans, carePolicy, hostingNotice, priceFor, smallChanges, type Billing, type PlanName } from "./care-data";
import styles from "./care.module.css";

type CareStep = "verify" | "code" | "review" | "processing" | "success" | "error";
type ManageStep = "email" | "code" | "list";
type CancellationReason = "too_expensive" | "no_longer_needed" | "not_satisfied" | "switching_providers" | "other";

const buttonClass = `${buttonStyles.ctaButton} ${styles.button}`;
const reasonLabels: Record<CancellationReason, string> = {
  too_expensive: "Too expensive",
  no_longer_needed: "No longer needed",
  not_satisfied: "Not satisfied",
  switching_providers: "Switching providers",
  other: "Other",
};

function Spinner() {
  return <span className={styles.careSpinner} aria-hidden="true" />;
}

function SuccessMark() {
  return (
    <svg className={styles.careSuccessMark} viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <circle cx="40" cy="40" r="34" />
      <path d="m24 42 11 11 22-26" />
    </svg>
  );
}

function createAttemptId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `care-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function planIdForName(name: PlanName) {
  return name === "Care Basic" ? "care-basic" : name === "Care Pro" ? "care-pro" : "care-plus";
}

function billingToApi(value: Billing): "monthly" | "yearly" {
  return value === "Yearly" ? "yearly" : "monthly";
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function formatOre(value: number) {
  return `${new Intl.NumberFormat("sv-SE").format(value / 100)} SEK`;
}

function subscriptionStatusText(subscription: CareSubscription) {
  if (subscription.cancelAtPeriodEnd) return "Active until paid period ends";
  return subscription.status.replace(/_/g, " ");
}

export default function CareSubscriptionFlow() {
  const [billing, setBilling] = useState<Billing>("Monthly");
  const [plan, setPlan] = useState<PlanName>("Care Plus");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [attemptId, setAttemptId] = useState(createAttemptId);
  const [verificationToken, setVerificationToken] = useState("");
  const [code, setCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<CareStep>("verify");
  const [interactive, setInteractive] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [returnSessionId, setReturnSessionId] = useState("");
  const [returnStatus, setReturnStatus] = useState<CareSubscription | null>(null);
  const [manageEmail, setManageEmail] = useState("");
  const [manageAttemptId, setManageAttemptId] = useState(createAttemptId);
  const [manageToken, setManageToken] = useState("");
  const [manageCode, setManageCode] = useState("");
  const [manageStep, setManageStep] = useState<ManageStep>("email");
  const [subscriptions, setSubscriptions] = useState<CareSubscription[]>([]);
  const [cancelTarget, setCancelTarget] = useState<CareSubscription | null>(null);
  const [cancelReason, setCancelReason] = useState<CancellationReason>("no_longer_needed");
  const [cancelReasonText, setCancelReasonText] = useState("");

  useEffect(() => setInteractive(true), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    const email = params.get("email");
    const planParam = params.get("plan");
    const session = params.get("care_session_id");
    if (order) setOrderNumber(order);
    if (email) {
      setOrderEmail(email);
      setManageEmail(email);
    }
    if (carePlans.some(item => item.name === planParam)) setPlan(planParam as PlanName);
    if (params.get("careTest") === "1" || params.get("sandboxCare") === "1") setTestMode(true);
    if (session) {
      setReturnSessionId(session);
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("care_cancelled")) {
      setMessage("Care checkout was cancelled. No subscription was created.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds(current => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (!returnSessionId) return;
    let cancelled = false;
    let attempts = 0;
    let timeout = 0;
    async function pollCareStatus() {
      attempts += 1;
      const result = await getCareCheckoutStatus(returnSessionId);
      if (cancelled) return;
      if (result.success && result.subscription) {
        setReturnStatus(result.subscription);
        return;
      }
      if (attempts < 12) timeout = window.setTimeout(pollCareStatus, 2500);
    }
    void pollCareStatus();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [returnSessionId]);

  const selectedPlan = useMemo(() => carePlans.find(item => item.name === plan) ?? carePlans[1], [plan]);
  const selectedPrice = priceFor(selectedPlan, billing);
  const yearlySavings = selectedPlan.monthly * 12 - selectedPlan.yearly;

  async function sendCareCode() {
    const email = orderEmail.trim().toLowerCase();
    if (!/^#?\d{3,}$/.test(orderNumber.trim())) {
      setMessage("Please enter a valid BlueMind order number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid order email.");
      return;
    }
    setMessage("Sending verification code...");
    const result = await sendEmailVerificationCode({ email, checkoutAttemptId: attemptId, language: "en" });
    if (!result.success) {
      setMessage(result.error);
      return;
    }
    setOrderEmail(result.verification.email);
    setAttemptId(result.verification.checkoutAttemptId);
    setResendSeconds(result.verification.resendAfterSeconds || 60);
    setStep("code");
    setMessage("Verification code sent.");
  }

  async function verifyCareCode() {
    setMessage("Verifying email...");
    const result = await verifyEmailVerificationCode({ email: orderEmail.trim().toLowerCase(), checkoutAttemptId: attemptId, code });
    if (!result.success) {
      setMessage(result.error);
      return;
    }
    setOrderEmail(result.verification.email);
    setAttemptId(result.verification.checkoutAttemptId);
    setVerificationToken(result.verification.verificationToken);
    setStep("review");
    setMessage("Email verified.");
  }

  async function startCareCheckout() {
    setStep("processing");
    setMessage("Opening secure Stripe Checkout...");
    const result = await createCareStripeCheckout({
      planId: planIdForName(plan),
      billingInterval: billingToApi(billing),
      orderNumber,
      customerEmail: orderEmail,
      checkoutAttemptId: attemptId,
      emailVerificationToken: verificationToken,
      testMode,
    });
    if (!result.success) {
      setMessage(result.error);
      setStep("error");
      return;
    }
    window.location.assign(result.checkout.checkoutUrl);
  }

  async function sendManageCode() {
    const email = manageEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    setMessage("Sending management verification code...");
    const result = await sendEmailVerificationCode({ email, checkoutAttemptId: manageAttemptId, language: "en" });
    if (!result.success) {
      setMessage(result.error);
      return;
    }
    setManageEmail(result.verification.email);
    setManageAttemptId(result.verification.checkoutAttemptId);
    setManageStep("code");
    setMessage("Verification code sent.");
  }

  async function verifyManageCode() {
    const verified = await verifyEmailVerificationCode({ email: manageEmail.trim().toLowerCase(), checkoutAttemptId: manageAttemptId, code: manageCode });
    if (!verified.success) {
      setMessage(verified.error);
      return;
    }
    setManageToken(verified.verification.verificationToken);
    const loaded = await loadCareSubscriptions({ email: verified.verification.email, checkoutAttemptId: verified.verification.checkoutAttemptId, emailVerificationToken: verified.verification.verificationToken });
    if (!loaded.success) {
      setMessage(loaded.error);
      return;
    }
    setSubscriptions(loaded.subscriptions);
    setManageStep("list");
    setMessage(loaded.subscriptions.length ? "Subscriptions loaded." : "No BlueMind Care subscriptions were found for this email.");
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setMessage("Updating subscription renewal...");
    const result = await cancelCareSubscription({
      email: manageEmail,
      checkoutAttemptId: manageAttemptId,
      emailVerificationToken: manageToken,
      subscriptionId: cancelTarget.id,
      reason: cancelReason,
      reasonText: cancelReasonText,
    });
    if (!result.success) {
      setMessage(result.error);
      return;
    }
    setSubscriptions(current => current.map(item => item.id === result.subscription.id ? result.subscription : item));
    setCancelTarget(null);
    setMessage(result.subscription.billingInterval === "yearly" ? `Future annual renewal cancelled. Service remains active until ${formatDate(result.subscription.paidThroughDate)}.` : `Future monthly renewal cancelled. Service remains active until ${formatDate(result.subscription.paidThroughDate)}.`);
  }

  return <>
    <section className={`${styles.plansSection} ${pageStyles.enter}`} aria-labelledby="care-plans-title">
      <div className={styles.plansIntro}><h2 id="care-plans-title">Choose your BlueMind Care plan.</h2><p>BlueMind Care is available for websites connected to a BlueMind order.</p></div>
      <fieldset className={styles.billingToggle}>
        <legend className={styles.srOnly}>Pricing billing cycle</legend>
        {(["Monthly", "Yearly"] as const).map(cycle => <label key={cycle} className={styles.billingOption}>
          <input type="radio" name="pricing-billing" value={cycle} checked={billing === cycle} onChange={() => setBilling(cycle)} />
          <span>{cycle}{cycle === "Yearly" && <small>2 months free</small>}</span>
        </label>)}
      </fieldset>
      <p className={styles.saving}>Annual billing is paid upfront once per year: 10 months of payments for 12 months of service.</p>
      {testMode && <p className={styles.testNotice}>Sandbox Care Test Mode: Stripe will use separate 5 SEK monthly/yearly test prices.</p>}
      <div className={styles.pricing}>
        {carePlans.map(item => <article key={item.id} className={`${styles.plan} ${item.popular ? styles.popular : ""}`} aria-labelledby={`care-plan-${item.id}`}>
          <div className={styles.planTop}><span>{item.id}</span>{item.popular && <span className={styles.badge}><StarMark className={styles.star} />MOST POPULAR</span>}</div>
          <h3 id={`care-plan-${item.id}`}>{item.name}</h3>
          <p className={styles.description}>{item.description}</p>
          <div className={styles.priceSlot}><p key={billing} className={styles.price}><strong>{priceFor(item, billing).replace(" SEK", "")}</strong><span>SEK / {billing === "Monthly" ? "month" : "year"}</span></p></div>
          {billing === "Yearly" && <p className={styles.formNote}>Pay upfront. Save {yearlySavings.toLocaleString("sv-SE")} SEK and receive 12 months of coverage.</p>}
          <ul className={styles.featureList}>{item.features.map(feature => <li key={feature}><StarMark className={styles.star} /><span>{feature}</span></li>)}</ul>
          <button type="button" className={`${buttonClass} ${item.popular ? buttonStyles.primaryCta : ""}`} disabled={!interactive} onClick={() => { setPlan(item.name); document.getElementById("care-subscribe")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Choose {item.name}</button>
        </article>)}
      </div>
      <div className={styles.planNotes}><p>{hostingNotice}</p><p>Prefer to manage your website yourself? <span>No problem. BlueMind Care is optional.</span></p></div>
    </section>

    <section className={`${styles.faq} ${pageStyles.enter}`} aria-labelledby="care-faq-title">
      <h2 id="care-faq-title">A few things to know.</h2>
      <div className={styles.questions}>
        <details><summary>How can I cancel my subscription?</summary><p>For monthly plans, you can cancel future renewal at any time. Your service remains active until the end of your current paid month.</p><p>For annual plans, you pay once for 12 months of service at the price of 10 months. You can turn off automatic renewal at any time, and your service will remain active until the end of your paid annual period.</p></details>
        <details><summary>What counts as a small website change?</summary><p>Small website changes may include things like:</p><ul>{smallChanges.map(change => <li key={change}>{change}</li>)}</ul><p>New pages, new features, major redesigns, custom development, and larger changes are quoted separately.</p></details>
        <details><summary>Are hosting and domain fees included?</summary><p>{hostingNotice}</p></details>
        <details><summary>Can I switch plans later?</summary><p>{carePolicy.planChanges}</p></details>
      </div>
    </section>

    {returnSessionId && <section className={`${styles.formSection} ${styles.subscriptionPanel} ${pageStyles.enter}`} aria-live="polite">
      {returnStatus ? <div className={styles.careState}><SuccessMark /><h2>BlueMind Care activated</h2><p>Your subscription was confirmed by Stripe and saved by BlueMind.</p><dl><div><dt>Plan</dt><dd>{returnStatus.planName}</dd></div><div><dt>Billing</dt><dd>{returnStatus.billingInterval}</dd></div><div><dt>Paid through</dt><dd>{formatDate(returnStatus.paidThroughDate)}</dd></div></dl></div> : <div className={styles.careState}><Spinner /><h2>Confirming your subscription...</h2><p>Stripe is sending the verified subscription result to BlueMind.</p></div>}
    </section>}

    <section id="care-subscribe" className={`${styles.formSection} ${styles.subscriptionPanel} ${pageStyles.enter}`} aria-labelledby="care-subscribe-title">
      <h2 id="care-subscribe-title">Subscribe to BlueMind Care</h2>
      <p className={styles.formIntro}>Enter the order number and verified order email for the website you want covered.</p>
      <div className={styles.selection}><strong>{selectedPlan.name}</strong><span>{billing} - {testMode ? "5 SEK Sandbox Test" : `${selectedPrice} / ${billing === "Monthly" ? "month" : "year"}`}</span></div>

      {step === "verify" && <>
        <div className={styles.formGrid}>
          <div className={styles.field}><label htmlFor="care-order-number">Order Number <span aria-hidden="true">*</span></label><input id="care-order-number" value={orderNumber} onChange={event => { setOrderNumber(event.target.value); setVerificationToken(""); }} placeholder="#512" required /><p className={styles.formNote}>BlueMind Care is available for websites connected to a BlueMind order.</p></div>
          <div className={styles.field}><label htmlFor="care-order-email">Order Email <span aria-hidden="true">*</span></label><input id="care-order-email" type="email" value={orderEmail} onChange={event => { setOrderEmail(event.target.value); setVerificationToken(""); }} placeholder="customer@email.com" required /></div>
        </div>
        <button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} disabled={!interactive || resendSeconds > 0} onClick={sendCareCode}>{resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Send Verification Code"}</button>
      </>}

      {step === "code" && <div className={styles.careReview}>
        <h3>Verify order email</h3>
        <p className={styles.formNote}>Enter the six-digit code sent to {orderEmail}.</p>
        <div className={styles.field}><label htmlFor="care-code">Verification code</label><input id="care-code" inputMode="numeric" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" /></div>
        <button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} disabled={code.length !== 6} onClick={verifyCareCode}>Verify Email</button>
      </div>}

      {step === "review" && <div className={styles.careReview}>
        <h3>Review Care Plan</h3>
        <dl><div><dt>Plan</dt><dd>{selectedPlan.name}</dd></div><div><dt>Billing</dt><dd>{billing}</dd></div><div><dt>Price</dt><dd>{testMode ? "5 SEK Sandbox Test" : selectedPrice}</dd></div><div><dt>Order</dt><dd>{orderNumber}</dd></div><div><dt>Email</dt><dd>{orderEmail}</dd></div>{billing === "Yearly" && <div><dt>Coverage</dt><dd>12 months, paid upfront</dd></div>}</dl>
        <button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={startCareCheckout}>Continue to Stripe Checkout</button>
      </div>}

      {step === "processing" && <div className={styles.careState}><Spinner /><h3>Opening Stripe Checkout...</h3><p>Please keep this window open.</p></div>}
      {step === "error" && <div className={styles.careState}><h3>We could not start the subscription.</h3><p>{message}</p><button type="button" className={buttonClass} onClick={() => setStep("verify")}>Try Again</button></div>}
      {message && <p className={message.toLowerCase().includes("error") || message.toLowerCase().includes("could not") ? styles.careVerifyError : styles.careVerifySuccess}>{message}</p>}
    </section>

    <section className={`${styles.formSection} ${styles.subscriptionPanel} ${pageStyles.enter}`} aria-labelledby="care-manage-title">
      <h2 id="care-manage-title">Manage / Cancel Your Subscription</h2>
      <p className={styles.formIntro}>Verify your email to view and manage BlueMind Care subscriptions connected to that address.</p>
      {manageStep === "email" && <div className={styles.formGrid}><div className={styles.field}><label htmlFor="manage-email">Email Address</label><input id="manage-email" type="email" value={manageEmail} onChange={event => setManageEmail(event.target.value)} placeholder="customer@email.com" /></div><div className={styles.field}><label>&nbsp;</label><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={sendManageCode}>Next</button></div></div>}
      {manageStep === "code" && <div className={styles.careReview}><h3>Verify email ownership</h3><div className={styles.field}><label htmlFor="manage-code">Verification code</label><input id="manage-code" inputMode="numeric" maxLength={6} value={manageCode} onChange={event => setManageCode(event.target.value.replace(/\D/g, "").slice(0, 6))} /></div><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} disabled={manageCode.length !== 6} onClick={verifyManageCode}>Load Subscriptions</button></div>}
      {manageStep === "list" && <div className={styles.subscriptionList}>{subscriptions.length ? subscriptions.map(subscription => <article className={styles.subscriptionCard} key={subscription.id}><div><h3>{subscription.planName}</h3><p>{subscriptionStatusText(subscription)}</p></div><dl><div><dt>Billing</dt><dd>{subscription.billingInterval}</dd></div><div><dt>Price</dt><dd>{subscription.price}</dd></div><div><dt>Order</dt><dd>{subscription.orderNumber}</dd></div><div><dt>Next renewal</dt><dd>{subscription.cancelAtPeriodEnd ? "Renewal disabled" : formatDate(subscription.nextRenewalDate)}</dd></div><div><dt>Paid through</dt><dd>{formatDate(subscription.paidThroughDate)}</dd></div></dl><button type="button" className={buttonClass} disabled={subscription.cancelAtPeriodEnd} onClick={() => setCancelTarget(subscription)}>{subscription.billingInterval === "yearly" ? "Cancel Future Renewal" : "Cancel Subscription"}</button></article>) : <p>No BlueMind Care subscriptions were found for this verified email.</p>}</div>}
      {cancelTarget && <div className={styles.cancelPanel}><h3>{cancelTarget.billingInterval === "yearly" ? "Cancel future annual renewal" : "Cancel monthly renewal"}</h3><p>Your service remains active until {formatDate(cancelTarget.paidThroughDate)}.</p><label>Why would you like to cancel?<select value={cancelReason} onChange={event => setCancelReason(event.target.value as CancellationReason)}>{(Object.keys(reasonLabels) as CancellationReason[]).map(reason => <option key={reason} value={reason}>{reasonLabels[reason]}</option>)}</select></label>{cancelReason === "other" && <label>Tell us more<textarea value={cancelReasonText} onChange={event => setCancelReasonText(event.target.value)} rows={3} /></label>}<div className={styles.checkoutActions}><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={confirmCancel}>Confirm Cancellation</button><button type="button" className={buttonClass} onClick={() => setCancelTarget(null)}>Keep Subscription</button></div></div>}
    </section>
  </>;
}
