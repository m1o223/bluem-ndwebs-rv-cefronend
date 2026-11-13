"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLockup } from "./brand-lockup";
import { useLocalization } from "./localization-provider";
import styles from "./site-menu-overlay.module.css";

const links = [
  ["/", "Home"],
  ["/about", "About Us"],
  ["/services", "Services"],
  ["/templates", "Website Templates"],
  ["/how-we-work", "How We Work"],
  ["/care", "Subscriptions"],
  ["/contact", "Contact Us"],
  ["/quote", "Pricing"],
] as const;

const localizedLinks = {
  en: ["Home", "About Us", "Services", "Website Templates", "How We Work", "Subscriptions", "Contact Us", "Pricing"],
  sv: ["Hem", "Om oss", "Tjänster", "Webbplatsmallar", "Så arbetar vi", "Prenumerationer", "Kontakta oss", "Priser"],
  ar: ["الرئيسية", "من نحن", "الخدمات", "قوالب المواقع", "كيف نعمل", "الاشتراكات", "تواصل معنا", "الأسعار"],
} as const;

const panelText = {
  en: { close: "Close", title: "Menu", navigation: "Main navigation" },
  sv: { close: "Stäng", title: "Meny", navigation: "Huvudnavigation" },
  ar: { close: "إغلاق", title: "القائمة", navigation: "التنقّل الرئيسي" },
} as const;

const closeDuration = 240;

export default function SiteMenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale } = useLocalization();
  const close = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const closeRequested = useRef(false);
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const rtl = locale === "ar";
  const text = panelText[locale];
  const labels = localizedLinks[locale];

  const requestClose = useCallback(() => {
    if (closeRequested.current) return;
    closeRequested.current = true;
    setClosing(true);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setRendered(false);
      onClose();
      closeRequested.current = false;
    }, closeDuration);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      closeRequested.current = false;
      setRendered(true);
      setClosing(false);
      return;
    }
    if (!rendered || closeRequested.current) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => setRendered(false), closeDuration);
    return () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); };
  }, [open, rendered]);

  useEffect(() => {
    if (!rendered) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") requestClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus?.();
    };
  }, [rendered, requestClose]);

  if (!rendered) return null;
  return (
    <div className={styles.overlay} data-closing={closing || undefined} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
      <section id="site-navigation-panel" className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="site-menu-title" dir={rtl ? "rtl" : "ltr"}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="BlueMind Web Service home" onClick={requestClose}><BrandLockup solidLogo /></Link>
          <button ref={close} className={styles.close} type="button" onClick={requestClose} aria-label={text.close}><X size={20} aria-hidden="true" /><span>{text.close}</span></button>
        </header>
        <div className={styles.content}>
          <h2 id="site-menu-title">{text.title}</h2>
          <nav className={styles.linkList} aria-label={text.navigation}>
            {links.map(([href], index) => <Link key={href} href={href} onClick={requestClose}><span>{labels[index]}</span><ArrowRight size={20} aria-hidden="true" /></Link>)}
          </nav>
        </div>
      </section>
    </div>
  );
}
