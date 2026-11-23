"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { BrandLockup } from "./brand-lockup";
import { useLocalization, type Locale } from "./localization-provider";
import styles from "./ai-coming-soon.module.css";

export type ComingSoonKind = "ai" | "pricing" | "subscriptions";

type ComingSoonCopy = { title: string; body: string; close: string; back: string };

const copy: Record<ComingSoonKind, Record<Locale, ComingSoonCopy>> = {
  ai: {
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
      body: "\u0639\u0645 \u0646\u062c\u0647\u0651\u0632 BlueMind AI \u0644\u064a\u0643\u0648\u0646 \u062c\u0627\u0647\u0632\u064b\u0627 \u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0642\u0631\u064a\u0628\u064b\u0627.",
      close: "\u062a\u0645\u0627\u0645",
      back: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639",
    },
  },
  pricing: {
    en: {
      title: "Pricing is coming soon",
      body: "We're preparing the pricing page. It will be available soon.",
      close: "Got it",
      back: "Back to home",
    },
    sv: {
      title: "Priser kommer snart",
      body: "Vi f\u00f6rbereder prissidan. Den blir tillg\u00e4nglig snart.",
      close: "Okej",
      back: "Tillbaka till startsidan",
    },
    ar: {
      title: "\u0635\u0641\u062d\u0629 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632",
      body: "\u0639\u0645 \u0646\u062c\u0647\u0651\u0632 \u0635\u0641\u062d\u0629 \u0627\u0644\u0623\u0633\u0639\u0627\u0631\u060c \u0648\u0631\u062d \u062a\u0643\u0648\u0646 \u0645\u062a\u0627\u062d\u0629 \u0642\u0631\u064a\u0628\u064b\u0627.",
      close: "\u062a\u0645\u0627\u0645",
      back: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    },
  },
  subscriptions: {
    en: {
      title: "Subscriptions are coming soon",
      body: "We're preparing the subscriptions page. It will be available soon.",
      close: "Got it",
      back: "Back to home",
    },
    sv: {
      title: "Prenumerationer kommer snart",
      body: "Vi f\u00f6rbereder prenumerationssidan. Den blir tillg\u00e4nglig snart.",
      close: "Okej",
      back: "Tillbaka till startsidan",
    },
    ar: {
      title: "\u0635\u0641\u062d\u0629 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a \u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632",
      body: "\u0639\u0645 \u0646\u062c\u0647\u0651\u0632 \u0635\u0641\u062d\u0629 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a\u060c \u0648\u0631\u062d \u062a\u0643\u0648\u0646 \u0645\u062a\u0627\u062d\u0629 \u0642\u0631\u064a\u0628\u064b\u0627.",
      close: "\u062a\u0645\u0627\u0645",
      back: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    },
  },
};

export type ComingSoonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  href: string;
  children: ReactNode;
  kind?: ComingSoonKind;
  onOpen?: () => void;
};

type ScrollPosition = { x: number; y: number };

export function ComingSoonModal({ kind, onClose, initialScrollPosition }: { kind: ComingSoonKind; onClose: () => void; initialScrollPosition?: ScrollPosition }) {
  const { locale } = useLocalization();
  const text = copy[kind][locale];
  const closeButton = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const scrollPosition = initialScrollPosition ?? { x: window.scrollX, y: window.scrollY };
    window.scrollTo({ ...scrollPosition, behavior: "auto" });
    const focusFrame = window.requestAnimationFrame(() => {
      closeButton.current?.focus({ preventScroll: true });
      window.scrollTo({ ...scrollPosition, behavior: "auto" });
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus({ preventScroll: true });
      window.scrollTo({ ...scrollPosition, behavior: "auto" });
    };
  }, [initialScrollPosition]);

  const dialog = (
    <div
      className={styles.overlay}
      role="presentation"
      data-no-translate
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="coming-soon-title" dir={locale === "ar" ? "rtl" : "ltr"}>
        <BrandLockup serviceName="WEB SERVICE" solidLogo className={styles.dialogBrand} />
        <h2 id="coming-soon-title">{text.title}</h2>
        <p>{text.body}</p>
        <button ref={closeButton} type="button" className={styles.closeButton} onClick={() => onCloseRef.current()}>{text.close}</button>
      </section>
    </div>
  );

  return typeof document === "undefined" ? null : createPortal(dialog, document.body);
}

export function ComingSoonLink({ href, kind = "ai", children, onOpen, ...props }: ComingSoonLinkProps) {
  void kind;
  return <a {...props} href={href} onClick={() => onOpen?.()}>{children}</a>;
}

export function AiComingSoonLink(props: Omit<ComingSoonLinkProps, "kind">) {
  return <ComingSoonLink {...props} kind="ai" />;
}

export function ComingSoonPage({ kind = "ai", backHref = "/", backLabel }: { kind?: ComingSoonKind; backHref?: string; backLabel?: string }) {
  const { locale } = useLocalization();
  const text = copy[kind][locale];
  return (
    <main className={styles.page} data-no-translate dir={locale === "ar" ? "rtl" : "ltr"}>
      <section className={styles.pageCard} aria-labelledby="coming-soon-page-title">
        <BrandLockup serviceName="WEB SERVICE" solidLogo className={styles.pageBrand} />
        <h1 id="coming-soon-page-title">{text.title}</h1>
        <p>{text.body}</p>
        <Link href={backHref} className={styles.backButton}>{backLabel || text.back}</Link>
      </section>
    </main>
  );
}

export function AiComingSoonPage({ backHref = "/", backLabel }: { backHref?: string; backLabel?: string }) {
  return <ComingSoonPage kind="ai" backHref={backHref} backLabel={backLabel} />;
}
