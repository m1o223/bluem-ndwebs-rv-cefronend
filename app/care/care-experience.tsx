"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { StarMark } from "../../components/star-mark";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { carePlans, carePolicy, hostingNotice, priceFor, smallChanges, type Billing, type PlanName } from "./care-data";
import styles from "./care.module.css";

type RequiredField = "fullName" | "email" | "website" | "plan" | "billing";
type Errors = Partial<Record<RequiredField, string>>;
const previewNotice = "Request sending is not connected yet. This form checks your details only; it does not activate a subscription.";
const buttonClass = `${buttonStyles.ctaButton} ${styles.button}`;

export default function CareExperience() {
  const [billing, setBilling] = useState<Billing>("Monthly");
  const [plan, setPlan] = useState<PlanName | "">("");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState(previewNotice);
  const [interactive, setInteractive] = useState(false);
  const formSection = useRef<HTMLElement>(null);
  const planSelect = useRef<HTMLSelectElement>(null);
  useEffect(() => setInteractive(true), []);
  const selectedPlan = carePlans.find(item => item.name === plan);

  function changeBilling(value: Billing) { setBilling(value); setNotice(previewNotice); }
  function choosePlan(name: PlanName) {
    setPlan(name);
    setErrors(current => ({ ...current, plan: undefined }));
    setNotice(previewNotice);
    formSection.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    planSelect.current?.focus({ preventScroll: true });
  }
  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const next: Errors = {};
    if (!value("fullName")) next.fullName = "Please enter your full name.";
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    if (!value("email") || !emailInput.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) next.email = "Please enter a valid email address.";
    try { const url = new URL(value("website")); if (!["https:", "http:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password) throw new Error("Invalid website"); }
    catch { next.website = "Please enter a valid website URL beginning with https:// or http://."; }
    if (!carePlans.some(item => item.name === value("plan"))) next.plan = "Please select a care plan.";
    if (!["Monthly", "Yearly"].includes(value("billing"))) next.billing = "Please select a billing cycle.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      setNotice(previewNotice);
      const input = form.elements.namedItem(first);
      if (input instanceof HTMLElement) input.focus();
      return;
    }
    setNotice("Your details passed validation. Request sending is not connected yet; no request was sent and no subscription was activated.");
  }
  const describedBy = (field: RequiredField) => errors[field] ? `care-${field}-error` : undefined;
  const errorMessage = (field: RequiredField) => errors[field] ? <p id={`care-${field}-error`} className={styles.error}>{errors[field]}</p> : null;

  return <>
    <section className={`${styles.plansSection} ${pageStyles.enter}`} aria-labelledby="care-plans-title">
      <div className={styles.plansIntro}><h2 id="care-plans-title">Keep your website running smoothly.</h2><p>Choose the level of care that fits your website. Pay monthly or save with annual billing.</p></div>
      <fieldset className={styles.billingToggle}>
        <legend className={styles.srOnly}>Pricing billing cycle</legend>
        {(["Monthly", "Yearly"] as const).map(cycle => <label key={cycle} className={styles.billingOption}>
          <input type="radio" name="pricing-billing" value={cycle} checked={billing === cycle} onChange={() => changeBilling(cycle)} />
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
          <button type="button" className={`${buttonClass} ${item.popular ? buttonStyles.primaryCta : ""}`} disabled={!interactive} onClick={() => choosePlan(item.name)}>Choose {item.name}</button>
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
    <section id="care-form" ref={formSection} className={`${styles.formSection} ${pageStyles.enter}`} aria-labelledby="care-form-title">
      <h2 id="care-form-title">Get BlueMind Care</h2>
      <p className={styles.formIntro}>Choose your plan and tell us which website you’d like us to look after.</p>
      <form noValidate onSubmit={submitRequest} onChange={() => setNotice(previewNotice)} aria-labelledby="care-form-title" aria-describedby="care-required care-notice">
        <p id="care-required" className={styles.formNote}>Fields marked * are required.</p>
        <div className={styles.formGrid}>
          <div className={styles.field}><label htmlFor="care-fullName">Full Name <span aria-hidden="true">*</span></label><input id="care-fullName" name="fullName" autoComplete="name" required aria-invalid={errors.fullName ? true : undefined} aria-describedby={describedBy("fullName")} />{errorMessage("fullName")}</div>
          <div className={styles.field}><label htmlFor="care-email">Email Address <span aria-hidden="true">*</span></label><input id="care-email" name="email" type="email" autoComplete="email" required aria-invalid={errors.email ? true : undefined} aria-describedby={describedBy("email")} />{errorMessage("email")}</div>
          <div className={styles.field}><label htmlFor="care-website">Website URL <span aria-hidden="true">*</span></label><input id="care-website" name="website" type="url" autoComplete="url" placeholder="https://example.com" required aria-invalid={errors.website ? true : undefined} aria-describedby={describedBy("website")} />{errorMessage("website")}</div>
          <div className={styles.field}><label htmlFor="care-company">Company / Brand <span className={styles.optional}>(Optional)</span></label><input id="care-company" name="company" autoComplete="organization" /></div>
          <div className={styles.field}><label htmlFor="care-plan">Selected Plan <span aria-hidden="true">*</span></label><select id="care-plan" name="plan" ref={planSelect} value={plan} onChange={event => setPlan(event.target.value as PlanName)} required aria-invalid={errors.plan ? true : undefined} aria-describedby={describedBy("plan")}><option value="" disabled>Select a plan</option>{carePlans.map(item => <option key={item.id}>{item.name}</option>)}</select>{errorMessage("plan")}</div>
          <div className={styles.field}><label htmlFor="care-billing">Billing <span aria-hidden="true">*</span></label><select id="care-billing" name="billing" value={billing} onChange={event => changeBilling(event.target.value as Billing)} required aria-invalid={errors.billing ? true : undefined} aria-describedby={describedBy("billing")}><option>Monthly</option><option>Yearly</option></select>{errorMessage("billing")}</div>
          <p id="care-selection" className={styles.selection} role="status">{selectedPlan ? <><strong>{selectedPlan.name}</strong><span>{billing} · {priceFor(selectedPlan, billing)} / {billing === "Monthly" ? "month" : "year"}</span></> : "Select a plan to see your care request price."}</p>
          <div className={`${styles.field} ${styles.fullWidth}`}><label htmlFor="care-message">Message <span className={styles.optional}>(Optional)</span></label><textarea id="care-message" name="message" rows={5} /></div>
        </div>
        <button type="submit" className={`${buttonClass} ${buttonStyles.primaryCta}`} disabled={!interactive}>Request BlueMind Care</button>
        <p id="care-notice" className={styles.formNotice} role="status">{notice}</p>
      </form>
    </section>
  </>;
}
