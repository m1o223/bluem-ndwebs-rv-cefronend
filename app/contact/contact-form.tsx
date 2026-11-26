"use client";

import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import { useLocalization } from "../../components/localization-provider";
import { postApi } from "../lib/api-client";
import styles from "./contact.module.css";
import revealStyles from "../../components/page-reveal.module.css";

type RequiredField = "fullName" | "email" | "contactType" | "message";
type FieldErrors = Partial<Record<RequiredField, string>>;
const contactTypes = ["Company", "Freelancer", "Individual"] as const;
type ContactType = typeof contactTypes[number];

type SendPhase = "idle" | "sending" | "flying" | "sent";
type FlightState = {
  startX: number;
  startY: number;
  forward: number;
  radius: number;
  endY: number;
};

const sendCopy = {
  en: { send: "Send Message", sending: "Sending...", sent: "Sent", flightLabel: "Message sent" },
  sv: { send: "Skicka meddelande", sending: "Skickar...", sent: "Skickat", flightLabel: "Meddelandet skickat" },
  ar: { send: "إرسال الرسالة", sending: "جارٍ الإرسال...", sent: "تم الإرسال", flightLabel: "تم إرسال الرسالة" },
} as const;

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
        aria-required="true"
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function cubicPoint(t: number, p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]): [number, number] {
  const inverse = 1 - t;
  return [
    inverse ** 3 * p0[0] + 3 * inverse ** 2 * t * p1[0] + 3 * inverse * t ** 2 * p2[0] + t ** 3 * p3[0],
    inverse ** 3 * p0[1] + 3 * inverse ** 2 * t * p1[1] + 3 * inverse * t ** 2 * p2[1] + t ** 3 * p3[1],
  ];
}

function cubicTangent(t: number, p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]): [number, number] {
  const inverse = 1 - t;
  return [
    3 * inverse ** 2 * (p1[0] - p0[0]) + 6 * inverse * t * (p2[0] - p1[0]) + 3 * t ** 2 * (p3[0] - p2[0]),
    3 * inverse ** 2 * (p1[1] - p0[1]) + 6 * inverse * t * (p2[1] - p1[1]) + 3 * t ** 2 * (p3[1] - p2[1]),
  ];
}

export default function ContactForm() {
  const { locale } = useLocalization();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");
  const [contactType, setContactType] = useState("");
  const [interactive, setInteractive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendPhase, setSendPhase] = useState<SendPhase>("idle");
  const [flight, setFlight] = useState<FlightState | null>(null);
  const [flightSuccessVisible, setFlightSuccessVisible] = useState(false);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const flightPlaneRef = useRef<HTMLImageElement>(null);

  useEffect(() => setInteractive(true), []);

  useEffect(() => {
    if (!flight) return;

    const plane = flightPlaneRef.current;
    if (!plane) return;

    let frame = 0;
    const startedAt = performance.now();
    const duration = 2_150;
    const straightEnd = 0.14;
    const turnEnd = 0.48;
    const forwardPoint: [number, number] = [flight.forward, 0];
    const turnEndPoint: [number, number] = [flight.forward + flight.radius, -flight.radius];
    const endPoint: [number, number] = [turnEndPoint[0], flight.endY];
    const turnControlOne: [number, number] = [flight.forward + flight.radius * 0.7, 0];
    const turnControlTwo: [number, number] = [turnEndPoint[0], -flight.radius * 0.42];

    const draw = (now: number) => {
      const progress = clamp((now - startedAt) / duration, 0, 1);
      let point: [number, number];
      let tangent: [number, number];

      if (progress < straightEnd) {
        const local = progress / straightEnd;
        point = [flight.forward * local, 0];
        tangent = [1, 0];
      } else if (progress < turnEnd) {
        const local = (progress - straightEnd) / (turnEnd - straightEnd);
        point = cubicPoint(local, forwardPoint, turnControlOne, turnControlTwo, turnEndPoint);
        tangent = cubicTangent(local, forwardPoint, turnControlOne, turnControlTwo, turnEndPoint);
      } else {
        const local = (progress - turnEnd) / (1 - turnEnd);
        point = [turnEndPoint[0], turnEndPoint[1] + (endPoint[1] - turnEndPoint[1]) * local];
        tangent = [0, -1];
      }

      const angle = Math.atan2(tangent[1], tangent[0]) * (180 / Math.PI) + 90;
      const scale = 1 - Math.max(0, progress - 0.55) * 0.1;
      const opacity = progress > 0.88 ? 1 - (progress - 0.88) / 0.12 : 1;
      const transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`;

      plane.style.left = `${flight.startX + point[0]}px`;
      plane.style.top = `${flight.startY + point[1]}px`;
      plane.style.opacity = String(opacity);
      plane.style.transform = transform;

      if (progress < 1) {
        frame = window.requestAnimationFrame(draw);
        return;
      }

      setFlight(null);
      setFlightSuccessVisible(true);
      setSendPhase("sent");
      setSubmitting(false);
    };

    const successTimer = window.setTimeout(() => setFlightSuccessVisible(true), 360);
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(successTimer);
    };
  }, [flight]);

  function getFlightStart() {
    const button = sendButtonRef.current;
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    const startX = rect.right - Math.min(32, rect.width * 0.18);
    const startY = rect.top + rect.height / 2;
    const availableRight = Math.max(54, window.innerWidth - startX - 24);
    const forward = clamp(Math.min(50, window.innerWidth * 0.08), 25, Math.min(50, availableRight * 0.28));
    const radius = clamp(Math.min(140, window.innerHeight * 0.15, availableRight - forward), 54, Math.max(54, availableRight - forward));
    return { startX, startY, forward, radius, endY: -72 };
  }

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
    setSendPhase("sending");
    setFlightSuccessVisible(false);
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
    if (!result.success) {
      setSubmitting(false);
      setSendPhase("idle");
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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSubmitting(false);
      setSendPhase("sent");
      setFlightSuccessVisible(true);
      return;
    }

    const flightStart = getFlightStart();
    if (!flightStart) {
      setSubmitting(false);
      setSendPhase("sent");
      setFlightSuccessVisible(true);
      return;
    }
    setSendPhase("flying");
    setFlight(flightStart);
  }

  function errorMessage(field: RequiredField) {
    return errors[field] ? <p id={`contact-${field}-error`} className={styles.fieldError}>{errors[field]}</p> : null;
  }

  const disabled = !interactive || submitting;
  const copy = sendCopy[locale];
  const showSuccess = sendPhase === "sent" || flightSuccessVisible;
  const buttonStyle = { "--send-button-min-width": locale === "ar" ? "194px" : "184px" } as CSSProperties;

  return (
    <>
      <form className={styles.form} aria-labelledby="form-preview-title" noValidate onSubmit={handleSubmit} onChange={() => { setNotice(""); if (!submitting && sendPhase === "sent") { setSendPhase("idle"); setFlightSuccessVisible(false); } }}>
      <div className={styles.formLayout}>
        <div className={styles.formDetails}>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${revealStyles.item}`} data-page-reveal-group="name-email">
              <label htmlFor="contact-fullName">Full Name <span className={styles.srOnly}>Required</span></label>
              <input id="contact-fullName" name="fullName" type="text" autoComplete="name" maxLength={160} required aria-required="true" aria-invalid={errors.fullName ? true : undefined} aria-describedby={errors.fullName ? "contact-fullName-error" : undefined} disabled={submitting} />
              {errorMessage("fullName")}
            </div>
            <div className={`${styles.field} ${revealStyles.item}`} data-page-reveal-group="name-email">
              <label htmlFor="contact-email">Email Address <span className={styles.srOnly}>Required</span></label>
              <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={320} required aria-required="true" aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "contact-email-error" : undefined} disabled={submitting} />
              {errorMessage("email")}
            </div>
            <div className={`${styles.field} ${revealStyles.item}`} data-page-reveal-group="type-company">
              <label htmlFor="contact-contactType">Contact Type <span className={styles.srOnly}>Required</span></label>
              <ContactTypeSelect value={contactType} onChange={value => { setContactType(value); setNotice(""); }} error={errors.contactType} disabled={disabled} />
              {errorMessage("contactType")}
            </div>
            <div className={`${styles.field} ${revealStyles.item}`} data-page-reveal-group="type-company">
              <label htmlFor="contact-company">Company / Brand Name <span className={styles.optional}>(Optional)</span></label>
              <input id="contact-company" name="company" type="text" autoComplete="organization" maxLength={180} disabled={submitting} />
            </div>
            <div className={`${styles.field} ${styles.orderField} ${revealStyles.item}`} data-page-reveal-group="order">
              <label htmlFor="contact-orderNumber">Order Number <span className={styles.optional}>(Optional)</span></label>
              <input id="contact-orderNumber" name="orderNumber" type="text" maxLength={100} aria-describedby="contact-order-help" disabled={submitting} />
              <p id="contact-order-help" className={styles.fieldHelp}>For an existing order.</p>
            </div>
          </div>
        </div>
        <div className={styles.messagePanel}>
          <div className={`${styles.field} ${styles.messageField} ${revealStyles.item}`} data-page-reveal-group="message">
            <label htmlFor="contact-message">Message <span className={styles.srOnly}>Required</span></label>
            <textarea id="contact-message" name="message" rows={5} maxLength={4000} required aria-required="true" aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? "contact-message-error" : undefined} disabled={submitting} />
            {errorMessage("message")}
          </div>
          <div className={revealStyles.item} data-page-reveal-group="send">
            <button
              ref={sendButtonRef}
              className={styles.sendButton}
              data-send-phase={sendPhase}
              style={buttonStyle}
              type="submit"
              disabled={disabled}
              aria-busy={submitting}
            >
              {showSuccess ? <Check className={styles.sendCheck} size={19} strokeWidth={2.6} aria-hidden="true" /> : null}
              <span className={styles.sendButtonLabel}>{showSuccess ? copy.sent : sendPhase === "sending" || sendPhase === "flying" ? copy.sending : copy.send}</span>
              {sendPhase === "sending" ? <span className={styles.sendSpinner} aria-hidden="true" /> : null}
            </button>
          </div>
        </div>
      </div>
      {notice ? <p id="contact-preview" className={styles.formNotice} role="status">{notice}</p> : null}
      </form>
      {flight && typeof document !== "undefined" ? createPortal(<img ref={flightPlaneRef} className={styles.flightPlane} src="/images/contact/send-plane.png" alt="" aria-label={copy.flightLabel} />, document.body) : null}
    </>
  );
}
