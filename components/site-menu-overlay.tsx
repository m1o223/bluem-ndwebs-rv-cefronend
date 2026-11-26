"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLockup } from "./brand-lockup";
import { useLocalization } from "./localization-provider";
import { AiComingSoonLink, ComingSoonLink } from "./ai-coming-soon";
import styles from "./site-menu-overlay.module.css";

const links = [
  ["/", "Home"],
  ["/ask-ai", "BlueMind AI"],
  ["/about", "About Us"],
  ["/services", "Services"],
  ["/templates", "Website Templates"],
  ["/our-work", "Our Work"],
  ["/care", "Subscriptions"],
  ["/contact", "Contact Us"],
  ["/quote", "Pricing"],
  ["/security", "Security"],
  ["/reviews", "Reviews"],
] as const;

const localizedLinks = {
  en: ["Home", "BlueMind AI", "About Us", "Services", "Website Templates", "Our Work", "Subscriptions", "Contact Us", "Pricing", "Security", "Reviews"],
  sv: ["Hem", "BlueMind AI", "Om oss", "Tj\u00e4nster", "Webbplatsmallar", "V\u00e5rt arbete", "Prenumerationer", "Kontakta oss", "Priser", "S\u00e4kerhet", "Recensioner"],
  ar: ["\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629", "BlueMind AI", "\u0645\u0646 \u0646\u062d\u0646", "\u0627\u0644\u062e\u062f\u0645\u0627\u062a", "\u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u0645\u0648\u0627\u0642\u0639", "\u0623\u0639\u0645\u0627\u0644\u0646\u0627", "\u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a", "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627", "\u0627\u0644\u0623\u0633\u0639\u0627\u0631", "\u0627\u0644\u0623\u0645\u0627\u0646", "\u0622\u0631\u0627\u0621 \u0627\u0644\u0639\u0645\u0644\u0627\u0621"],
} as const;

const panelText = {
  en: { close: "Close", title: "Menu", navigation: "Main navigation", signIn: "Sign in" },
  sv: { close: "St\u00e4ng", title: "Meny", navigation: "Huvudnavigation", signIn: "Logga in" },
  ar: { close: "\u0625\u063a\u0644\u0627\u0642", title: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629", navigation: "\u0627\u0644\u062a\u0646\u0642\u0644 \u0627\u0644\u0631\u0626\u064a\u0633\u064a", signIn: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644" },
} as const;

const closeDuration = 320;
type ScrollPosition = { x: number; y: number };
const TEST_SITE = process.env.NEXT_PUBLIC_TEST_SITE === "true";

function matchesCurrentPath(href: string, currentPath?: string) {
  if (!currentPath) return false;
  if (href === "/") return currentPath === "/";
  if (href === "/templates") return currentPath === "/templates" || currentPath.startsWith("/templates/");
  if (href === "/ask-ai") return currentPath === "/ask-ai" || currentPath === "/blue-mind-ai";
  return href === currentPath;
}

export default function SiteMenuOverlay({ open, onClose, scrollPosition, currentPath, titleOverride, side = "right" }: { open: boolean; onClose: () => void; scrollPosition?: ScrollPosition; currentPath?: string; titleOverride?: string; side?: "left" | "right" }) {
  const { locale } = useLocalization();
  const close = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const openFrame = useRef<number | null>(null);
  const closeRequested = useRef(false);
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const [entered, setEntered] = useState(open);
  const rtl = locale === "ar";
  const text = panelText[locale];
  const labels = localizedLinks[locale];
  const visibleLinks = links;

  const requestClose = useCallback(() => {
    if (closeRequested.current) return;
    closeRequested.current = true;
    if (openFrame.current) window.cancelAnimationFrame(openFrame.current);
    setClosing(true);
    setEntered(false);
    onClose();
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setRendered(false);
      closeRequested.current = false;
    }, closeDuration);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      if (openFrame.current) window.cancelAnimationFrame(openFrame.current);
      closeRequested.current = false;
      setRendered(true);
      setClosing(false);
      setEntered(false);
      openFrame.current = window.requestAnimationFrame(() => {
        openFrame.current = window.requestAnimationFrame(() => setEntered(true));
      });
      return;
    }
    if (!rendered || closeRequested.current) return;
    setClosing(true);
    setEntered(false);
    closeTimer.current = window.setTimeout(() => setRendered(false), closeDuration);
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      if (openFrame.current) window.cancelAnimationFrame(openFrame.current);
    };
  }, [open, rendered]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (openFrame.current) window.cancelAnimationFrame(openFrame.current);
  }, []);

  useEffect(() => {
    if (!rendered) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const body = document.body;
    const root = document.documentElement;
    // The parent ref can be one render behind the click on mobile Safari.
    // A zero ref is only useful at the top; otherwise read the live position
    // before fixing the body so opening the menu cannot jump to the page start.
    const hasCapturedPosition = Number.isFinite(scrollPosition?.y) && (scrollPosition?.y ?? 0) > 0;
    const scrollX = hasCapturedPosition ? scrollPosition!.x : window.scrollX;
    const scrollY = hasCapturedPosition ? scrollPosition!.y : window.scrollY;
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
    <div className={styles.overlay} data-side={side} data-test-site={TEST_SITE ? "true" : undefined} data-closing={closing || undefined} data-entered={entered ? "true" : undefined} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
      <section id="site-navigation-panel" className={styles.panel} data-entered={entered ? "true" : undefined} role="dialog" aria-modal="true" aria-labelledby="site-menu-title" dir={rtl ? "rtl" : "ltr"}>
        <header className={styles.header}>
          {TEST_SITE ? <Link href="/" className={styles.brand} aria-label="BlueMind Web Service home" onClick={requestClose}><BrandLockup solidLogo /></Link> : <h2 id="site-menu-title">{titleOverride || text.title}</h2>}
          <button ref={close} className={styles.close} type="button" onClick={requestClose} aria-label={text.close}><X size={TEST_SITE ? 20 : 22} aria-hidden="true" />{TEST_SITE && <span>{text.close}</span>}</button>
        </header>
        <div className={styles.content}>
          {TEST_SITE && <h2 id="site-menu-title">{titleOverride || text.title}</h2>}
          <nav className={styles.linkList} aria-label={text.navigation}>
            {visibleLinks.map(([href], index) => {
              if (matchesCurrentPath(href, currentPath)) return null;
              const originalIndex = links.findIndex(([candidate]) => candidate === href);
              const kind = href === "/quote" ? "pricing" : href === "/care" ? "subscriptions" : null;
              const content = <><span>{labels[originalIndex]}</span><ArrowRight size={20} aria-hidden="true" /></>;
              return kind ? (
                <ComingSoonLink key={href} href={href} kind={kind} onOpen={requestClose}>{content}</ComingSoonLink>
              ) : href === "/ask-ai" ? (
                <AiComingSoonLink key={href} href={href} onOpen={requestClose}>{content}</AiComingSoonLink>
              ) : (
                <Link key={href} href={href} onClick={requestClose}>{content}</Link>
              );
            })}
          </nav>
          {!TEST_SITE && <Link className={styles.signInLink} href="/sign-in" onClick={requestClose}><span>{text.signIn}</span><ArrowRight size={20} aria-hidden="true" /></Link>}
        </div>
      </section>
    </div>
  );
}
