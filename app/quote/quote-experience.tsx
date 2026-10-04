"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { includedFeatures, interestOptions, packages, timelineOptions } from "./quote-data";
import styles from "./quote.module.css";

type RequiredField = "fullName" | "email" | "interest" | "idea";
type Errors = Partial<Record<RequiredField, string>>;
const previewNotice = "Quote sending is not connected yet. This form currently checks your details only.";
const buttonClass = `${buttonStyles.ctaButton} ${buttonStyles.primaryCta} ${styles.button}`;

function StarMark() {
  return <svg className={styles.star} viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path fill="currentColor" d="m10 0 2.4 7.6L20 10l-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4Z" /></svg>;
}

function DeviceMark({ device }: { device: "Desktop" | "Tablet" | "Mobile" }) {
  return <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {device === "Desktop" ? <><rect x="4" y="6" width="32" height="23" rx="3" /><path d="M14 35h12m-6-6v6M4 24h32" /></> : <><rect x={device === "Tablet" ? 8 : 12} y="3" width={device === "Tablet" ? 24 : 16} height="34" rx="4" /><path d="M18 32h4" /></>}
  </svg>;
}

export default function QuoteExperience() {
  const [interest, setInterest] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState(previewNotice);
  const [interactive, setInteractive] = useState(false);
  const formSection = useRef<HTMLElement>(null);
  const interestSelect = useRef<HTMLSelectElement>(null);
  useEffect(() => setInteractive(true), []);

  function choosePackage(name: string) {
    setInterest(name);
    setErrors(current => ({ ...current, interest: undefined }));
    setNotice(previewNotice);
    formSection.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    interestSelect.current?.focus({ preventScroll: true });
  }

  function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (field: string) => String(data.get(field) ?? "").trim();
    const next: Errors = {};
    if (!value("fullName")) next.fullName = "Please enter your full name.";
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    if (!value("email") || !emailInput.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) next.email = "Please enter a valid email address.";
    if (!interestOptions.includes(value("interest"))) next.interest = "Please select an option.";
    if (!value("idea")) next.idea = "Please tell us about your idea.";
    setErrors(next);
    const first = Object.keys(next)[0] as RequiredField | undefined;
    if (first) {
      setNotice(previewNotice);
      const input = form.elements.namedItem(first);
      if (input instanceof HTMLElement) input.focus();
      return;
    }
    setNotice("Your details passed validation. Quote sending is not connected yet; no request was sent.");
  }

  const describedBy = (field: RequiredField) => errors[field] ? `quote-${field}-error` : undefined;
  const errorMessage = (field: RequiredField) => errors[field] ? <p id={`quote-${field}-error`} className={styles.error}>{errors[field]}</p> : null;

  return (
    <>
      <div className={`${styles.valueIntro} ${pageStyles.enter}`}>
        <StarMark />
        <div><h2>More included. No unnecessary extras.</h2><p>Professional websites built for desktop, tablet and mobile — included as standard.</p></div>
      </div>
      <section className={`${styles.pricing} ${pageStyles.enter}`} aria-label="Website packages and starting prices">
        {packages.map(item => (
          <article key={item.id} className={`${styles.package} ${item.popular ? styles.popular : ""}`} aria-labelledby={`package-${item.id}`}>
            <div className={styles.packageTop}><span>{item.id}</span>{item.popular && <span className={styles.badge}><StarMark />MOST POPULAR</span>}</div>
            <div className={styles.summary}>
              <h2 id={`package-${item.id}`}>{item.title}</h2>
              <p className={styles.price}>{item.price.startsWith("From ") ? <><span>From </span>{item.price.slice(5)}</> : item.price}</p>
              <p className={styles.delivery}>{item.delivery}</p>
              {item.scope && <p className={styles.scope}>{item.scope}</p>}
            </div>
            <p className={styles.description}>{item.description}</p>
            <ul className={styles.featureList}>{item.features.map(feature => <li key={feature}><StarMark /><span>{feature}</span></li>)}</ul>
            {item.id === "06" && <p className={styles.customNote}>Examples depend on your project. Your quote defines the included features and timeline.</p>}
            <button type="button" className={buttonClass} disabled={!interactive} onClick={() => choosePackage(item.title)}>{item.cta}</button>
          </article>
        ))}
      </section>
      <div className={styles.disclaimer}>
        <p>Starting prices. Final price and delivery time depend on your project requirements.</p>
        <p>Third-party costs such as domains, hosting, paid plugins, payment-provider fees, and external services are not included unless stated otherwise.</p>
      </div>
      <section className={`${styles.included} ${pageStyles.enter}`} aria-labelledby="included-title">
        <h2 id="included-title">Included with every website</h2>
        <div className={styles.deviceValue}>
          <div className={styles.devices}>{(["Desktop", "Tablet", "Mobile"] as const).map(device => <div key={device}><DeviceMark device={device} /><span>{device.toUpperCase()}</span></div>)}</div>
          <div><h3>Included as standard.</h3><p>No extra design charge for responsive layouts.</p></div>
        </div>
        <div className={styles.includedGrid}>{includedFeatures.map(feature => <div key={feature.title} className={styles.includedFeature}><StarMark /><div><h3>{feature.title}</h3><p>{feature.text}</p></div></div>)}</div>
      </section>
      <section className={`${styles.notSure} ${pageStyles.enter}`} aria-labelledby="not-sure-title">
        <div><h2 id="not-sure-title">Not sure which option is right for you?</h2><p>Tell us what you have in mind. We’ll help you find the right option for your project.</p></div>
        <button type="button" className={buttonClass} disabled={!interactive} onClick={() => choosePackage("Not Sure Yet")}>Tell Us About Your Project</button>
      </section>
      <section id="quote-form" ref={formSection} className={`${styles.formSection} ${pageStyles.enter}`} aria-labelledby="quote-form-title">
        <h2 id="quote-form-title">Tell us about your project</h2>
        <form noValidate onSubmit={submitQuote} aria-labelledby="quote-form-title" aria-describedby="quote-required quote-notice" onChange={() => setNotice(previewNotice)}>
          <p id="quote-required" className={styles.formNote}>Fields marked * are required.</p>
          <div className={styles.formGrid}>
            <div className={styles.field}><label htmlFor="quote-fullName">Full Name <span aria-hidden="true">*</span></label><input id="quote-fullName" name="fullName" autoComplete="name" required aria-invalid={errors.fullName ? true : undefined} aria-describedby={describedBy("fullName")} />{errorMessage("fullName")}</div>
            <div className={styles.field}><label htmlFor="quote-email">Email Address <span aria-hidden="true">*</span></label><input id="quote-email" name="email" type="email" autoComplete="email" required aria-invalid={errors.email ? true : undefined} aria-describedby={describedBy("email")} />{errorMessage("email")}</div>
            <div className={styles.field}><label htmlFor="quote-company">Company / Brand Name <span className={styles.optional}>(Optional)</span></label><input id="quote-company" name="company" autoComplete="organization" /></div>
            <div className={styles.field}><label htmlFor="quote-interest">I&apos;m interested in <span aria-hidden="true">*</span></label><select id="quote-interest" name="interest" ref={interestSelect} value={interest} onChange={event => setInterest(event.target.value)} required aria-invalid={errors.interest ? true : undefined} aria-describedby={describedBy("interest")}><option value="" disabled>Select an option</option>{interestOptions.map(option => <option key={option}>{option}</option>)}</select>{errorMessage("interest")}</div>
            <div className={`${styles.field} ${styles.fullWidth}`}><label htmlFor="quote-idea">Tell us about your idea <span aria-hidden="true">*</span></label><textarea id="quote-idea" name="idea" rows={7} required aria-invalid={errors.idea ? true : undefined} aria-describedby={[describedBy("idea"), "quote-idea-help"].filter(Boolean).join(" ")} />{errorMessage("idea")}<div id="quote-idea-help" className={styles.helper}><p>Not sure how to explain your idea?</p><p>You can use ChatGPT to help describe what you have in mind, then paste it here.</p></div></div>
            <div className={styles.field}><label htmlFor="quote-timeline">When would you like it ready? <span className={styles.optional}>(Optional)</span></label><select id="quote-timeline" name="timeline" defaultValue=""><option value="">Select a timeline</option>{timelineOptions.map(option => <option key={option}>{option}</option>)}</select></div>
          </div>
          <button type="submit" className={buttonClass} disabled={!interactive}>Request My Quote</button>
          <p id="quote-notice" className={styles.formNotice} role="status">{notice}</p>
        </form>
      </section>
    </>
  );
}
