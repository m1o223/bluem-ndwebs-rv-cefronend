"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { postApi } from "../lib/api-client";
import styles from "./contact.module.css";

type RequiredField = "fullName" | "email" | "contactType" | "message";
type FieldErrors = Partial<Record<RequiredField, string>>;
const contactTypes = ["Company", "Freelancer", "Individual"] as const;
type ContactType = typeof contactTypes[number];

type ContactTypeSelectProps = {
  value: string;
  onChange: (value: ContactType) => void;
  error?: string;
  disabled: boolean;
};

function ContactTypeSelect({ value, onChange, error, disabled }: ContactTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedIndex = contactTypes.indexOf(value as ContactType);

  useEffect(() => {
    if (!open) return;

    function closeOnOutside(event: PointerEvent) {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    }

    function positionMenu() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const estimatedHeight = contactTypes.length * 48 + 12;
      setOpenUp(rect.bottom + estimatedHeight > window.innerHeight - 16 && rect.top > estimatedHeight);
    }

    positionMenu();
    document.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open]);

  function choose(option: ContactType) {
    onChange(option);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && !open) {
      event.preventDefault();
      setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
      setOpen(true);
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted(index => (index + step + contactTypes.length) % contactTypes.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setHighlighted(event.key === "Home" ? 0 : contactTypes.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(contactTypes[highlighted]);
    }
  }

  return (
    <div className={styles.selectField} data-open={open || undefined} data-direction={openUp ? "up" : "down"}>
      <button
        ref={triggerRef}
        id="contact-contactType"
        className={styles.selectTrigger}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="contact-contactType-options"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "contact-contactType-error" : undefined}
        aria-label="Contact Type"
        disabled={disabled}
        onClick={() => {
          setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
          setOpen(current => !current);
        }}
        onKeyDown={handleKeyDown}
      >
        <span className={`${styles.selectValue} ${value ? "" : styles.selectPlaceholder}`}>{value || "Select contact type"}</span>
        <span className={styles.selectChevron} aria-hidden="true" />
      </button>
      <input type="hidden" name="contactType" value={value} />
      {open ? (
        <div ref={menuRef} id="contact-contactType-options" className={styles.selectMenu} role="listbox" aria-label="Contact Type">
          {contactTypes.map((option, index) => (
            <button
              key={option}
              className={styles.selectOption}
              type="button"
              role="option"
              aria-selected={value === option}
              data-highlighted={highlighted === index || undefined}
              data-selected={value === option || undefined}
              onMouseEnter={() => setHighlighted(index)}
              onClick={() => choose(option)}
            >
              <span>{option}</span>
              {value === option ? <span className={styles.selectCheck} aria-hidden="true">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");
  const [contactType, setContactType] = useState("");
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
      setNotice("");
      const input = firstError === "contactType" ? document.getElementById("contact-contactType") : form.elements.namedItem(firstError);
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    setSubmitting(true);
    setNotice("Sending your message...");
    const orderNumber = value("orderNumber");
    const result = await postApi("/api/contact", {
      name: value("fullName"),
      email,
      contactType: value("contactType"),
      company: value("company") || undefined,
      orderNumber: orderNumber || undefined,
      message: value("message"),
    });
    setSubmitting(false);

    if (!result.success) {
      const serverFields: FieldErrors = {
        fullName: result.fields?.fullName || result.fields?.name,
        email: result.fields?.email,
        contactType: result.fields?.contactType,
        message: result.fields?.message,
      };
      setErrors(serverFields);
      setNotice(result.error || "We could not send your message. Please try again.");
      return;
    }

    form.reset();
    setContactType("");
    setErrors({});
    setNotice(result.message);
  }

  function errorMessage(field: RequiredField) {
    return errors[field] ? <p id={`contact-${field}-error`} className={styles.fieldError}>{errors[field]}</p> : null;
  }

  const disabled = !interactive || submitting;

  return (
    <form className={styles.form} aria-labelledby="form-preview-title" aria-describedby="contact-required" noValidate onSubmit={handleSubmit} onChange={() => setNotice("")}>
      <p id="contact-required" className={styles.requiredNote}>* Required</p>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="contact-fullName">Full Name <span aria-hidden="true">*</span></label>
          <input id="contact-fullName" name="fullName" type="text" autoComplete="name" maxLength={160} required aria-invalid={errors.fullName ? true : undefined} aria-describedby={errors.fullName ? "contact-fullName-error" : undefined} disabled={submitting} />
          {errorMessage("fullName")}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Email Address <span aria-hidden="true">*</span></label>
          <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={320} required aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "contact-email-error" : undefined} disabled={submitting} />
          {errorMessage("email")}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-contactType">Contact Type <span aria-hidden="true">*</span></label>
          <ContactTypeSelect value={contactType} onChange={value => { setContactType(value); setNotice(""); }} error={errors.contactType} disabled={disabled} />
          {errorMessage("contactType")}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-company">Company / Brand Name <span className={styles.optional}>(Optional)</span></label>
          <input id="contact-company" name="company" type="text" autoComplete="organization" maxLength={180} disabled={submitting} />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-orderNumber">Order Number <span className={styles.optional}>(Optional)</span></label>
          <input id="contact-orderNumber" name="orderNumber" type="text" maxLength={100} aria-describedby="contact-order-help" disabled={submitting} />
          <p id="contact-order-help" className={styles.fieldHelp}>For an existing order.</p>
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor="contact-message">Message <span aria-hidden="true">*</span></label>
          <textarea id="contact-message" name="message" rows={5} maxLength={4000} required aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? "contact-message-error" : undefined} disabled={submitting} />
          {errorMessage("message")}
        </div>
      </div>
      <button className={styles.sendButton} type="submit" disabled={disabled}>{submitting ? "Sending..." : "Send Message"}</button>
      {notice ? <p id="contact-preview" className={styles.formNotice} role="status">{notice}</p> : null}
    </form>
  );
}
