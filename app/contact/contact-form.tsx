"use client";

import { useEffect, useState, type FormEvent } from "react";
import { postApi } from "../lib/api-client";
import styles from "./contact.module.css";

type RequiredField = "fullName" | "email" | "contactType" | "message";
type FieldErrors = Partial<Record<RequiredField, string>>;
const contactTypes = ["Company", "Freelancer", "Individual"] as const;
const readyNotice = "Send us a message and we will get back to you.";

export default function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState(readyNotice);
  const [interactive, setInteractive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setInteractive(true), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const nextErrors: FieldErrors = {};

    if (!value("fullName")) nextErrors.fullName = "Please enter your name.";
    const email = value("email");
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    if (!email || !emailInput.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!contactTypes.some(type => type === value("contactType"))) {
      nextErrors.contactType = "Please select a contact type.";
    }
    if (!value("message")) nextErrors.message = "Please enter your message.";

    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0] as RequiredField | undefined;
    if (firstError) {
      setNotice(readyNotice);
      const input = form.elements.namedItem(firstError);
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    setSubmitting(true);
    setNotice("Sending your message...");
    const orderNumber = value("orderNumber");
    const result = await postApi("/api/contact", {
      name: value("fullName"),
      email,
      company: value("company") || undefined,
      subject: [value("contactType"), orderNumber ? `Order ${orderNumber}` : ""].filter(Boolean).join(" - ") || undefined,
      message: value("message")
    });
    setSubmitting(false);

    if (!result.success) {
      setNotice(result.error || "We could not send your message. Please try again.");
      return;
    }

    form.reset();
    setErrors({});
    setNotice(result.message);
  }

  function errorMessage(field: RequiredField) {
    return errors[field] ? <p id={`contact-${field}-error`} className={styles.fieldError}>{errors[field]}</p> : null;
  }

  const disabled = !interactive || submitting;

  return (
    <form className={styles.form} aria-labelledby="form-preview-title" aria-describedby="contact-required contact-preview" noValidate onSubmit={handleSubmit} onChange={() => setNotice(readyNotice)}>
      <p id="contact-required" className={styles.requiredNote}>Fields marked * are required.</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="contact-fullName">Full Name <span aria-hidden="true">*</span></label>
          <input id="contact-fullName" name="fullName" type="text" autoComplete="name" required aria-invalid={errors.fullName ? true : undefined} aria-describedby={errors.fullName ? "contact-fullName-error" : undefined} disabled={submitting} />
          {errorMessage("fullName")}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Email Address <span aria-hidden="true">*</span></label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "contact-email-error" : undefined} disabled={submitting} />
          {errorMessage("email")}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-contactType">Contact Type <span aria-hidden="true">*</span></label>
          <select id="contact-contactType" name="contactType" defaultValue="" required aria-invalid={errors.contactType ? true : undefined} aria-describedby={errors.contactType ? "contact-contactType-error" : undefined} disabled={submitting}>
            <option value="" disabled>Select contact type</option>
            {contactTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          {errorMessage("contactType")}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-company">Company / Brand Name <span className={styles.optional}>(Optional)</span></label>
          <input id="contact-company" name="company" type="text" autoComplete="organization" disabled={submitting} />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-orderNumber">Order Number <span className={styles.optional}>(Optional)</span></label>
          <input id="contact-orderNumber" name="orderNumber" type="text" aria-describedby="contact-order-help" disabled={submitting} />
          <p id="contact-order-help" className={styles.fieldHelp}>For an existing order, if applicable.</p>
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor="contact-message">Message <span aria-hidden="true">*</span></label>
          <textarea id="contact-message" name="message" rows={5} required aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? "contact-message-error" : undefined} disabled={submitting} />
          {errorMessage("message")}
        </div>
      </div>
      <button className={styles.sendButton} type="submit" disabled={disabled}>{submitting ? "Sending..." : "Send Message"}</button>
      <p id="contact-preview" className={styles.formNotice} role="status">{notice}</p>
    </form>
  );
}
