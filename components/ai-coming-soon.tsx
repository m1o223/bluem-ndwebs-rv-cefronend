"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { BrandLockup } from "./brand-lockup";
import { useLocalization, type Locale } from "./localization-provider";
import styles from "./ai-coming-soon.module.css";

const copy: Record<Locale, { title: string; body: string; close: string; back: string }> = {
  en: {
    title: "BlueMind AI is coming soon",
    body: "We're getting BlueMind AI ready for you. It will be ready to use soon.",
    close: "Got it",
    back: "Back to website",
  },
  sv: {
    title: "BlueMind AI kommer snart",
    body: "Vi f\u00f6rbereder BlueMind AI s\u00e5 att den snart \u00e4r redo f\u00f6r dig.",
    close: "Okej",
    back: "Tillbaka till webbplatsen",
  },
  ar: {
    title: "BlueMind AI \u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632",
    body: "\u0639\u0645 \u0646\u062c\u0647\u0651\u0632 BlueMind AI \u0644\u064a\u0643\u0648\u0646 \u062c\u0627\u0647\u0632 \u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0642\u0631\u064a\u0628\u064b\u0627.",
    close: "\u062a\u0645\u0627\u0645",
    back: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639",
  },
};

export type AiComingSoonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  href: string;
  children: ReactNode;
};

export function AiComingSoonModal({ onClose }: { onClose: () => void }) {
  const { locale } = useLocalization();
  const text = copy[locale];
  const closeButton = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButton.current?.focus({ preventScroll: true }));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  const dialog = (
    <div
      className={styles.overlay}
      role="presentation"
      data-no-translate
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="ai-coming-soon-title" dir={locale === "ar" ? "rtl" : "ltr"}>
        <BrandLockup serviceName="WEB SERVICE" solidLogo className={styles.dialogBrand} />
        <h2 id="ai-coming-soon-title">{text.title}</h2>
        <p>{text.body}</p>
        <button ref={closeButton} type="button" className={styles.closeButton} onClick={() => onCloseRef.current()}>{text.close}</button>
      </section>
    </div>
  );

  return typeof document === "undefined" ? null : createPortal(dialog, document.body);
}

export function AiComingSoonLink({ href, children, ...props }: AiComingSoonLinkProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a
        {...props}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </a>
      {open && <AiComingSoonModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function AiComingSoonPage({ backHref = "/", backLabel }: { backHref?: string; backLabel?: string }) {
  const { locale } = useLocalization();
  const text = copy[locale];
  return (
    <main className={styles.page} data-no-translate dir={locale === "ar" ? "rtl" : "ltr"}>
      <section className={styles.pageCard} aria-labelledby="ai-coming-soon-page-title">
        <BrandLockup serviceName="WEB SERVICE" solidLogo className={styles.pageBrand} />
        <h1 id="ai-coming-soon-page-title">{text.title}</h1>
        <p>{text.body}</p>
        <Link href={backHref} className={styles.backButton}>{backLabel || text.back}</Link>
      </section>
    </main>
  );
}
