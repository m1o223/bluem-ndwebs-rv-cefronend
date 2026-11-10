"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { BrandLockup } from "./brand-lockup";
import { useLocalization } from "./localization-provider";
import styles from "./site-menu-overlay.module.css";

const links = [
  ["/services", "Services"],
  ["/about", "About Us"],
  ["/how-we-work", "How We Work"],
  ["/templates", "Website Concepts"],
  ["/contact", "Contact Us"],
  ["/ask-ai", "BlueMind AI"],
] as const;

export default function SiteMenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale } = useLocalization();
  const close = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const rtl = locale === "ar";
  const text = locale === "sv"
    ? { close: "Stäng", eyebrow: "Navigering", title: "Utforska BlueMind", intro: "Alla webbplatsens sidor på ett ställe.", links: ["Tjänster", "Om oss", "Så arbetar vi", "Webbplatskoncept", "Kontakta oss", "BlueMind AI"] }
    : rtl
      ? { close: "إغلاق", eyebrow: "التنقّل", title: "استكشف BlueMind", intro: "كل صفحات الموقع في مكان واحد.", links: ["الخدمات", "من نحن", "كيف نعمل", "نماذج المواقع", "تواصل معنا", "BlueMind AI"] }
      : { close: "Close", eyebrow: "Navigation", title: "Explore BlueMind", intro: "Every main page, in one clear place.", links: links.map(([, label]) => label) };

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.overlay} role="presentation">
      <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="site-menu-title" dir={rtl ? "rtl" : "ltr"}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="BlueMind Web Service home" onClick={onClose}><BrandLockup solidLogo /></Link>
          <button ref={close} className={styles.close} type="button" onClick={onClose} aria-label={text.close}><X size={20} aria-hidden="true" /><span>{text.close}</span></button>
        </header>
        <div className={styles.content}>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h2 id="site-menu-title">{text.title}</h2>
          <p className={styles.intro}>{text.intro}</p>
          <nav className={styles.linkList} aria-label={text.eyebrow}>
            {links.map(([href], index) => <Link key={href} href={href} onClick={onClose}><span>{text.links[index]}</span><ArrowRight size={20} aria-hidden="true" /></Link>)}
          </nav>
        </div>
      </section>
    </div>
  );
}
