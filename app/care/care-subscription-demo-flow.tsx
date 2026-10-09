"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StarMark } from "../../components/star-mark";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { carePlans, carePolicy, hostingNotice, priceFor, smallChanges, type Billing, type PlanName } from "./care-data";
import styles from "./care.module.css";

type PurchaseStep = "details" | "payment" | "processing" | "success";
type CancelStep = "email" | "subscription" | "reason" | "confirm" | "processing" | "success" | "not-found";
type CancellationReason = "Too expensive" | "No longer needed" | "Not satisfied" | "Switching providers" | "Other";
type PaymentMethod = "Visa" | "Mastercard" | "Apple Pay" | "Google Pay" | "PayPal";

const buttonClass = `${buttonStyles.ctaButton} ${styles.button}`;
const cancellationReasons: CancellationReason[] = ["Too expensive", "No longer needed", "Not satisfied", "Switching providers", "Other"];
const paymentMethods: Array<PaymentMethod | "Klarna"> = ["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal", "Klarna"];

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

function nextRenewalDate(billing: Billing) {
  const date = new Date();
  date.setDate(date.getDate() + (billing === "Yearly" ? 365 : 30));
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function displayPrice(plan: typeof carePlans[number], billing: Billing) {
  return `${priceFor(plan, billing)} / ${billing === "Monthly" ? "month" : "year"}`;
}

function PaymentMethodCard({ method, selected, onSelect }: { method: PaymentMethod | "Klarna"; selected: boolean; onSelect: (method: PaymentMethod) => void }) {
  const disabled = method === "Klarna";
  return (
    <button
      type="button"
      className={styles.demoMethod}
      data-selected={selected}
      data-method={method.toLowerCase().replace(/\s+/g, "-")}
      disabled={disabled}
      onClick={() => !disabled && onSelect(method as PaymentMethod)}
    >
      <span className={styles.demoBrand}>{method}</span>
      <span>{method}{disabled && <small>Coming Soon</small>}</span>
    </button>
  );
}

export default function CareSubscriptionDemoFlow() {
  const [billing, setBilling] = useState<Billing>("Monthly");
  const [selectedPlanName, setSelectedPlanName] = useState<PlanName>("Care Plus");
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>("details");
  const [orderEmail, setOrderEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Visa");

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<CancelStep>("email");
  const [manageEmail, setManageEmail] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryOrderNumber, setRecoveryOrderNumber] = useState("");
  const [cancelReason, setCancelReason] = useState<CancellationReason>("No longer needed");
  const [cancelReasonText, setCancelReasonText] = useState("");

  const selectedPlan = useMemo(() => carePlans.find(item => item.name === selectedPlanName) ?? carePlans[1], [selectedPlanName]);
  const yearlySavings = selectedPlan.monthly * 12 - selectedPlan.yearly;

  useEffect(() => {
    if (!purchaseOpen && !cancelOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPurchaseOpen(false);
        setCancelOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [purchaseOpen, cancelOpen]);

  function openPurchaseModal(planName: PlanName) {
    setSelectedPlanName(planName);
    setPurchaseStep("details");
    setPurchaseError("");
    setPurchaseOpen(true);
  }

  function continueToPayment() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderEmail.trim())) {
      setPurchaseError("Please enter a valid email address.");
      return;
    }
    if (!/^#?\d{3,}$/.test(orderNumber.trim())) {
      setPurchaseError("Please enter a valid BlueMind order number.");
      return;
    }
    setPurchaseError("");
    setPurchaseStep("payment");
  }

  function simulatePayment() {
    setPurchaseStep("processing");
    window.setTimeout(() => setPurchaseStep("success"), 1400);
  }

  function closePurchase() {
    setPurchaseOpen(false);
    window.setTimeout(() => {
      setPurchaseStep("details");
      setPurchaseError("");
    }, 180);
  }

  function findDemoSubscription() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manageEmail.trim()) || manageEmail.toLowerCase().includes("notfound")) {
      setCancelStep("not-found");
      return;
    }
    setCancelStep("subscription");
  }

  function confirmCancellation() {
    setCancelStep("processing");
    window.setTimeout(() => setCancelStep("success"), 1300);
  }

  function closeCancel() {
    setCancelOpen(false);
    window.setTimeout(() => {
      setCancelStep("email");
      setCancelReason("No longer needed");
      setCancelReasonText("");
    }, 180);
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
      <div className={styles.pricing}>
        {carePlans.map(item => <article key={item.id} className={`${styles.plan} ${item.popular ? styles.popular : ""}`} aria-labelledby={`care-plan-${item.id}`}>
          <div className={styles.planTop}><span>{item.id}</span>{item.popular && <span className={styles.badge}><StarMark className={styles.star} />MOST POPULAR</span>}</div>
          <h3 id={`care-plan-${item.id}`}>{item.name}</h3>
          <p className={styles.description}>{item.description}</p>
          <div className={styles.priceSlot}><p key={billing} className={styles.price}><strong>{priceFor(item, billing).replace(" SEK", "")}</strong><span>SEK / {billing === "Monthly" ? "month" : "year"}</span></p></div>
          {billing === "Yearly" && <p className={styles.formNote}>Pay upfront. Save {(item.monthly * 12 - item.yearly).toLocaleString("sv-SE")} SEK and receive 12 months of coverage.</p>}
          <ul className={styles.featureList}>{item.features.map(feature => <li key={feature}><StarMark className={styles.star} /><span>{feature}</span></li>)}</ul>
          <button type="button" className={`${buttonClass} ${item.popular ? buttonStyles.primaryCta : ""}`} onClick={() => openPurchaseModal(item.name)}>Choose {item.name}</button>
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
      <div className={styles.cancelEntry}>
        <button type="button" className={buttonClass} onClick={() => setCancelOpen(true)}>Cancel Your Subscription</button>
      </div>
    </section>

    {purchaseOpen && <div className={styles.modalBackdrop} role="presentation">
      <section className={styles.careModal} role="dialog" aria-modal="true" aria-labelledby="care-purchase-title">
        <button type="button" className={styles.modalClose} onClick={closePurchase} aria-label="Close subscription modal"><span aria-hidden="true">&times;</span></button>
        {purchaseStep === "details" && <>
          <p className={styles.modalEyebrow}>Frontend demo only</p>
          <h2 id="care-purchase-title">Subscribe to BlueMind Care</h2>
          <div className={styles.modalSummary}><strong>{selectedPlan.name}</strong><span>{displayPrice(selectedPlan, billing)}</span></div>
          {billing === "Yearly" && <p className={styles.formNote}>Yearly billing is paid upfront. You save {yearlySavings.toLocaleString("sv-SE")} SEK and receive 12 months of service.</p>}
          <div className={styles.formGrid}>
            <div className={styles.field}><label htmlFor="care-demo-email">Email Address <span aria-hidden="true">*</span></label><input id="care-demo-email" type="email" value={orderEmail} onChange={event => setOrderEmail(event.target.value)} placeholder="customer@email.com" required /></div>
            <div className={styles.field}><label htmlFor="care-demo-order">Order Number <span aria-hidden="true">*</span></label><input id="care-demo-order" value={orderNumber} onChange={event => setOrderNumber(event.target.value)} placeholder="#512" required /></div>
          </div>
          <p className={styles.demoNotice}>Demo eligibility check only. No backend authentication, Stripe payment, email, or subscription is created today.</p>
          {purchaseError && <p className={styles.careVerifyError}>{purchaseError}</p>}
          <div className={styles.checkoutActions}><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={continueToPayment}>Continue to Payment</button></div>
        </>}
        {purchaseStep === "payment" && <>
          <p className={styles.modalEyebrow}>Demo payment step</p>
          <h2 id="care-purchase-title">Choose payment method</h2>
          <div className={styles.modalSummary}><strong>{selectedPlan.name}</strong><span>{displayPrice(selectedPlan, billing)}</span></div>
          <div className={styles.demoMethods}>{paymentMethods.map(method => <PaymentMethodCard key={method} method={method} selected={paymentMethod === method} onSelect={setPaymentMethod} />)}</div>
          <p className={styles.demoNotice}>This is a visual frontend prototype. No card details are collected and no real payment is processed.</p>
          <div className={styles.checkoutActions}><button type="button" className={buttonClass} onClick={() => setPurchaseStep("details")}>Back</button><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={simulatePayment}>Simulate Payment</button></div>
        </>}
        {purchaseStep === "processing" && <div className={styles.careState}><Spinner /><h2>Preparing demo subscription...</h2><p>This simulated step will become real only after backend and Stripe connection.</p></div>}
        {purchaseStep === "success" && <div className={styles.careState}><SuccessMark /><h2>BlueMind Care demo subscription ready.</h2><p>This is a frontend-only success state. No payment was processed and no email was sent.</p><dl><div><dt>Plan</dt><dd>{selectedPlan.name}</dd></div><div><dt>Billing</dt><dd>{billing}</dd></div><div><dt>Price</dt><dd>{displayPrice(selectedPlan, billing)}</dd></div></dl><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={closePurchase}>Done</button></div>}
      </section>
    </div>}

    {cancelOpen && <div className={styles.modalBackdrop} role="presentation">
      <section className={styles.careModal} role="dialog" aria-modal="true" aria-labelledby="care-cancel-title">
        <button type="button" className={styles.modalClose} onClick={closeCancel} aria-label="Close cancellation modal"><span aria-hidden="true">&times;</span></button>
        {cancelStep === "email" && <>
          <p className={styles.modalEyebrow}>Frontend demo only</p>
          <h2 id="care-cancel-title">Manage Your Subscription</h2>
          <div className={styles.field}><label htmlFor="manage-demo-email">Email Address</label><input id="manage-demo-email" type="email" value={manageEmail} onChange={event => setManageEmail(event.target.value)} placeholder="customer@email.com" /></div>
          {recoveryOpen ? <div className={styles.field}><label htmlFor="recovery-order">Order Number</label><input id="recovery-order" value={recoveryOrderNumber} onChange={event => setRecoveryOrderNumber(event.target.value)} placeholder="#512" /></div> : <button type="button" className={styles.inlineButton} onClick={() => setRecoveryOpen(true)}>Forgot the email you used?</button>}
          <p className={styles.demoNotice}>Frontend preview only. Real subscription lookup will require secure email verification when the backend is connected.</p>
          <div className={styles.checkoutActions}><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={findDemoSubscription}>Find My Subscription</button><Link href="/contact" className={buttonClass} onClick={closeCancel}>Contact Us</Link></div>
        </>}
        {cancelStep === "not-found" && <div className={styles.careState}><h2 id="care-cancel-title">Subscription not found</h2><p>This is a demo state. We could not find a sample subscription for that email.</p><div className={styles.checkoutActions}><button type="button" className={buttonClass} onClick={() => setCancelStep("email")}>Try Again</button><Link href="/contact" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={closeCancel}>Contact Us</Link></div></div>}
        {cancelStep === "subscription" && <div className={styles.careReview}>
          <p className={styles.modalEyebrow}>Demo subscription data</p>
          <h2 id="care-cancel-title">Your subscription</h2>
          <dl><div><dt>Plan</dt><dd>Care Basic</dd></div><div><dt>Price</dt><dd>250 SEK / month</dd></div><div><dt>Status</dt><dd>Active</dd></div><div><dt>Next Renewal</dt><dd>{nextRenewalDate("Monthly")}</dd></div></dl>
          <p className={styles.demoNotice}>This is sample frontend data only. Real subscription details require future backend authentication.</p>
          <div className={styles.checkoutActions}><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={() => setCancelStep("reason")}>Cancel Subscription</button></div>
        </div>}
        {cancelStep === "reason" && <>
          <h2 id="care-cancel-title">Why would you like to cancel?</h2>
          <div className={styles.reasonList}>{cancellationReasons.map(reason => <label key={reason}><input type="radio" name="cancel-reason" checked={cancelReason === reason} onChange={() => setCancelReason(reason)} /> <span>{reason}</span></label>)}</div>
          {cancelReason === "Other" && <div className={styles.field}><label htmlFor="cancel-other">Additional comments</label><textarea id="cancel-other" rows={4} value={cancelReasonText} onChange={event => setCancelReasonText(event.target.value)} /></div>}
          <div className={styles.checkoutActions}><button type="button" className={buttonClass} onClick={() => setCancelStep("subscription")}>Back</button><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={() => setCancelStep("confirm")}>Continue</button></div>
        </>}
        {cancelStep === "confirm" && <div className={styles.careReview}>
          <h2 id="care-cancel-title">Confirm Cancellation</h2>
          <dl><div><dt>Plan</dt><dd>Care Basic</dd></div><div><dt>Billing</dt><dd>Monthly</dd></div><div><dt>Reason</dt><dd>{cancelReason}</dd></div></dl>
          <p className={styles.demoNotice}>Future renewal will stop, but the current paid period remains active until its end. Annual plans keep the already-paid 12-month coverage and only stop the next renewal.</p>
          <div className={styles.checkoutActions}><button type="button" className={buttonClass} onClick={closeCancel}>Keep Subscription</button><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={confirmCancellation}>Confirm Cancellation</button></div>
        </div>}
        {cancelStep === "processing" && <div className={styles.careState}><Spinner /><h2>Confirming demo cancellation...</h2><p>No Stripe subscription is being changed in this frontend prototype.</p></div>}
        {cancelStep === "success" && <div className={styles.careState}><SuccessMark /><h2>Your subscription cancellation has been confirmed.</h2><p>In the real flow, a confirmation email will be sent to your registered email address.</p><p className={styles.demoNotice}>Simulated result only. No email was sent. After backend connection, this appears only after Stripe confirms cancellation.</p><button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={closeCancel}>Done</button></div>}
      </section>
    </div>}
  </>;
}

