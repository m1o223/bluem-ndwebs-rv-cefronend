"use client";

import { useEffect, useMemo, useState } from "react";
import { StarMark } from "../../components/star-mark";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { carePlans, carePolicy, hostingNotice, priceFor, smallChanges, type Billing, type PlanName } from "./care-data";
import styles from "./care.module.css";

type PaymentMethod = "visa" | "mastercard" | "apple-pay" | "google-pay" | "paypal" | "klarna";
type CareStep = "verify" | "review" | "payment" | "processing" | "success";

const methodLabels: Record<PaymentMethod, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  "apple-pay": "Apple Pay",
  "google-pay": "Google Pay",
  paypal: "PayPal",
  klarna: "Klarna",
};

const buttonClass = `${buttonStyles.ctaButton} ${styles.button}`;

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

export default function CareSubscriptionFlow() {
  const [billing, setBilling] = useState<Billing>("Monthly");
  const [plan, setPlan] = useState<PlanName>("Care Plus");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [verification, setVerification] = useState<"idle" | "success" | "error">("idle");
  const [step, setStep] = useState<CareStep>("verify");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("visa");
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    const email = params.get("email");
    const planParam = params.get("plan");
    if (order) setOrderNumber(order);
    if (email) setOrderEmail(email);
    if (carePlans.some(item => item.name === planParam)) setPlan(planParam as PlanName);
  }, []);

  const selectedPlan = useMemo(() => carePlans.find(item => item.name === plan) ?? carePlans[1], [plan]);

  function verifyOrder() {
    const validOrder = /^#?\d{3,}$/.test(orderNumber.trim());
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderEmail.trim());
    if (!validOrder || !validEmail || orderEmail.toLowerCase().includes("wrong")) {
      setVerification("error");
      return;
    }
    setVerification("success");
    window.setTimeout(() => setStep("review"), 600);
  }

  function simulateCarePayment() {
    setStep("processing");
    window.setTimeout(() => setStep("success"), 2100);
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
      <p className={styles.saving}>2 months free with annual billing.</p>
      <div className={styles.pricing}>
        {carePlans.map(item => <article key={item.id} className={`${styles.plan} ${item.popular ? styles.popular : ""}`} aria-labelledby={`care-plan-${item.id}`}>
          <div className={styles.planTop}><span>{item.id}</span>{item.popular && <span className={styles.badge}><StarMark className={styles.star} />MOST POPULAR</span>}</div>
          <h3 id={`care-plan-${item.id}`}>{item.name}</h3>
          <p className={styles.description}>{item.description}</p>
          <div className={styles.priceSlot}><p key={billing} className={styles.price}><strong>{priceFor(item, billing).replace(" SEK", "")}</strong><span>SEK / {billing === "Monthly" ? "month" : "year"}</span></p></div>
          <ul className={styles.featureList}>{item.features.map(feature => <li key={feature}><StarMark className={styles.star} /><span>{feature}</span></li>)}</ul>
          <button type="button" className={`${buttonClass} ${item.popular ? buttonStyles.primaryCta : ""}`} disabled={!interactive} onClick={() => { setPlan(item.name); document.getElementById("care-subscribe")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Choose {item.name}</button>
        </article>)}
      </div>
      <div className={styles.planNotes}><p>{hostingNotice}</p><p>Prefer to manage your website yourself? <span>No problem. BlueMind Care is optional.</span></p></div>
    </section>

    <section className={`${styles.faq} ${pageStyles.enter}`} aria-labelledby="care-faq-title">
      <h2 id="care-faq-title">A few things to know.</h2>
      <div className={styles.questions}>
        <details><summary>Can I cancel my monthly plan?</summary><p>{carePolicy.cancellation}</p></details>
        <details><summary>What counts as a small website change?</summary><p>Small website changes may include things like:</p><ul>{smallChanges.map(change => <li key={change}>{change}</li>)}</ul><p>New pages, new features, major redesigns, custom development, and larger changes are quoted separately.</p></details>
        <details><summary>Are hosting and domain fees included?</summary><p>{hostingNotice}</p></details>
        <details><summary>Can I switch plans later?</summary><p>{carePolicy.planChanges}</p></details>
      </div>
    </section>

    <section id="care-subscribe" className={`${styles.formSection} ${styles.subscriptionPanel} ${pageStyles.enter}`} aria-labelledby="care-subscribe-title">
      <h2 id="care-subscribe-title">Subscribe to BlueMind Care</h2>
      <p className={styles.formIntro}>Enter the order number and verified order email for the website you want covered.</p>

      {step === "verify" && <>
        <div className={styles.selection}><strong>{selectedPlan.name}</strong><span>{billing} · {priceFor(selectedPlan, billing)} / {billing === "Monthly" ? "month" : "year"}</span></div>
        <div className={styles.formGrid}>
          <div className={styles.field}><label htmlFor="care-order-number">Order Number <span aria-hidden="true">*</span></label><input id="care-order-number" value={orderNumber} onChange={event => { setOrderNumber(event.target.value); setVerification("idle"); }} placeholder="#512" required /><p className={styles.formNote}>BlueMind Care is available for websites connected to a BlueMind order.</p></div>
          <div className={styles.field}><label htmlFor="care-order-email">Order Email <span aria-hidden="true">*</span></label><input id="care-order-email" type="email" value={orderEmail} onChange={event => { setOrderEmail(event.target.value); setVerification("idle"); }} placeholder="customer@email.com" required /></div>
        </div>
        {verification === "success" && <p className={styles.careVerifySuccess}><SuccessMark /> Order verified. Your website is eligible for BlueMind Care.</p>}
        {verification === "error" && <p className={styles.careVerifyError}>We couldn&apos;t match this order number with this email. Please check your details and try again.</p>}
        <button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} disabled={!interactive} onClick={verifyOrder}>Validate Order</button>
      </>}

      {step === "review" && <div className={styles.careReview}>
        <h3>Review Care Plan</h3>
        <dl><div><dt>Plan</dt><dd>{selectedPlan.name}</dd></div><div><dt>Billing</dt><dd>{billing}</dd></div><div><dt>Price</dt><dd>{priceFor(selectedPlan, billing)}</dd></div><div><dt>Order</dt><dd>{orderNumber}</dd></div><div><dt>Email</dt><dd>{orderEmail}</dd></div></dl>
        <button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} onClick={() => setStep("payment")}>Continue to Payment</button>
      </div>}

      {step === "payment" && <div className={styles.carePayment}>
        <h3>Choose payment method</h3>
        <p className={styles.formNote}>Frontend demo only. No payment is processed today.</p>
        <div className={styles.careMethods}>{(Object.keys(methodLabels) as PaymentMethod[]).map(method => <button key={method} type="button" disabled={method === "klarna"} data-selected={paymentMethod === method} onClick={() => setPaymentMethod(method)}><span>{methodLabels[method]}</span>{method === "klarna" && <small>Coming Soon</small>}</button>)}</div>
        {(paymentMethod === "visa" || paymentMethod === "mastercard") && <div className={styles.careCardDemo}><label>Card number<input placeholder="1234 5678 9012 3456" autoComplete="off" /></label><label>Expiry<input placeholder="MM / YY" autoComplete="off" /></label><label>CVC<input placeholder="CVC" autoComplete="off" /></label></div>}
        <button type="button" className={`${buttonClass} ${buttonStyles.primaryCta}`} disabled={paymentMethod === "klarna"} onClick={simulateCarePayment}>Pay {priceFor(selectedPlan, billing)}</button>
      </div>}

      {step === "processing" && <div className={styles.careState}><Spinner /><h3>Activating BlueMind Care...</h3><p>This is a frontend-only subscription simulation.</p></div>}

      {step === "success" && <div className={styles.careState}><SuccessMark /><h3>BlueMind Care activated</h3><dl><div><dt>Plan</dt><dd>{selectedPlan.name}</dd></div><div><dt>Billing</dt><dd>{billing}</dd></div><div><dt>Connected Order</dt><dd>{orderNumber}</dd></div><div><dt>Email</dt><dd>{orderEmail}</dd></div></dl><p>Your website is now covered by BlueMind Care.</p></div>}
    </section>
  </>;
}
