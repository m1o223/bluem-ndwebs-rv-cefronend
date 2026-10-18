"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X } from "lucide-react";
import { useLocalization } from "../localization-provider";
import styles from "./ai-coming-soon.module.css";

const copy = {
  en: { trigger: "Ask BlueMind AI", message: "BlueMind AI is coming soon. We\u2019re working on something exciting!", close: "Close" },
  sv: { trigger: "Fr\u00e5ga BlueMind AI", message: "BlueMind AI kommer snart. Vi arbetar p\u00e5 n\u00e5got sp\u00e4nnande!", close: "St\u00e4ng" },
  ar: { trigger: "\u0627\u0633\u0623\u0644 BlueMind AI", message: "BlueMind AI \u0642\u0627\u062f\u0645 \u0642\u0631\u064a\u0628\u0627\u064b. \u0646\u0639\u0645\u0644 \u0639\u0644\u0649 \u0634\u064a\u0621 \u0645\u0645\u064a\u0632!", close: "\u0625\u063a\u0644\u0627\u0642" },
};

export default function AiComingSoon({ triggerClassName }: { triggerClassName: string }) {
  const { locale, translate } = useLocalization();
  const text = copy[locale];
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !dialog.current) return;
    const current = dialog.current;
    const body = document.body;
    const { overflow, paddingRight } = body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbar > 0) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.overflow = "hidden";
    current.showModal();
    return () => {
      current.close();
      body.style.overflow = overflow;
      body.style.paddingRight = paddingRight;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return <>
    <button ref={trigger} type="button" className={`${triggerClassName} ${styles.trigger}`} aria-label={text.trigger} aria-haspopup="dialog" onClick={() => setOpen(true)} data-no-translate>
      {/* Preserve the original localized button width without shifting the hero. */}
      <span className={styles.sizer} aria-hidden="true">{translate("Explore Concepts")}</span>
      <span className={styles.label} aria-hidden="true" dir="auto">{text.trigger}<Sparkles size={15} /></span>
    </button>
    {open && createPortal(
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="ai-coming-soon-title" aria-describedby="ai-coming-soon-message" data-no-translate onCancel={event => { event.preventDefault(); setOpen(false); }} onKeyDown={event => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}>
        <header className={styles.header}>
          <h2 id="ai-coming-soon-title">BlueMind AI</h2>
          <button type="button" className={styles.iconControl} aria-label={text.close} title={text.close} onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button>
        </header>
        <p id="ai-coming-soon-message" className={styles.message} dir={locale === "ar" ? "rtl" : "ltr"}>{text.message}</p>
        <footer className={styles.footer}>
          <button type="button" className={styles.primaryClose} onClick={() => setOpen(false)}>{text.close}</button>
        </footer>
      </dialog>, document.body
    )}
  </>;
}
