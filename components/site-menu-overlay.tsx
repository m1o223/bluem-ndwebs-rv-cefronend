"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  sv: ["Hem", "Om oss", "Tj\u00e4nster", "Webbplatsmallar", "S\u00e5 arbetar vi", "Prenumerationer", "Kontakta oss", "Priser"],
  ar: ["\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629", "\u0645\u0646 \u0646\u062d\u0646", "\u0627\u0644\u062e\u062f\u0645\u0627\u062a", "\u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0645\u0648\u0627\u0642\u0639", "\u0643\u064a\u0641 \u0646\u0639\u0645\u0644", "\u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a", "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627", "\u0627\u0644\u0623\u0633\u0639\u0627\u0631"],
} as const;

const panelText = {
  en: { close: "Close", title: "Menu", navigation: "Main navigation" },
  sv: { close: "St\u00e4ng", title: "Meny", navigation: "Huvudnavigation" },
  ar: { close: "\u0625\u063a\u0644\u0627\u0642", title: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629", navigation: "\u0627\u0644\u062a\u0646\u0642\u0644 \u0627\u0644\u0631\u0626\u064a\u0633\u064a" },
} as const;

const closeDuration = 240;
type ScrollPosition = { x: number; y: number };

export default function SiteMenuOverlay({ open, onClose, scrollPosition }: { open: boolean; onClose: () => void; scrollPosition?: ScrollPosition }) {
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
    const body = document.body;
    const root = document.documentElement;
    const scrollX = scrollPosition?.x ?? window.scrollX;
    const scrollY = scrollPosition?.y ?? window.scrollY;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const bodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const rootStyles = {
      overflow: root.style.overflow,
      scrollbarGutter: root.style.scrollbarGutter,
      scrollBehavior: root.style.scrollBehavior,
    };

    // Keep the document at its current coordinates while the fixed overlay is open.
    // This avoids both the scrollbar-width jump and iOS Safari's scroll restoration.
    root.style.scrollBehavior = "auto";
    window.scrollTo(scrollX, scrollY);
    root.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = `-${scrollX}px`;
    body.style.right = "auto";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") requestClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.position = bodyStyles.position;
      body.style.top = bodyStyles.top;
      body.style.left = bodyStyles.left;
      body.style.right = bodyStyles.right;
      body.style.width = bodyStyles.width;
      body.style.overflow = bodyStyles.overflow;
      body.style.paddingRight = bodyStyles.paddingRight;
      root.style.overflow = rootStyles.overflow;
      root.style.scrollbarGutter = rootStyles.scrollbarGutter;
      root.style.scrollBehavior = rootStyles.scrollBehavior;
      window.scrollTo(scrollX, scrollY);
      previousFocus.current?.focus?.({ preventScroll: true });
    };
  }, [rendered, requestClose, scrollPosition]);

  if (!rendered) return null;
  return (
    <div className={styles.overlay} data-closing={closing || undefined} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
      <section id="site-navigation-panel" className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="site-menu-title" dir={rtl ? "rtl" : "ltr"}>
        <header className={styles.header}>
          <h2 id="site-menu-title">{text.title}</h2>
          <button ref={close} className={styles.close} type="button" onClick={requestClose} aria-label={text.close}><X size={22} aria-hidden="true" /></button>
        </header>
        <div className={styles.content}>
          <nav className={styles.linkList} aria-label={text.navigation}>
            {links.map(([href], index) => <Link key={href} href={href} onClick={requestClose}><span>{labels[index]}</span><ArrowRight size={20} aria-hidden="true" /></Link>)}
          </nav>
        </div>
      </section>
    </div>
  );
}
