"use client";

import { useEffect, useState } from "react";
import { useLocalization } from "./localization-provider";
import { cookieConsentCopy } from "./cookie-consent-copy";
import styles from "./cookie-consent.module.css";

export const COOKIE_CONSENT_KEY = "bluemind-cookie-consent";
export const COOKIE_SETTINGS_EVENT = "bluemind:open-cookie-settings";

export type CookieConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

function readConsent(): CookieConsentState | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_KEY) || "null") as Partial<CookieConsentState> | null;
    if (!parsed || parsed.necessary !== true || typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") return null;
    return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing, updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "" };
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean, marketing: boolean) {
  const next: CookieConsentState = { necessary: true, analytics, marketing, updatedAt: new Date().toISOString() };
  try { window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(next)); } catch { /* Private browsing may block storage. */ }
  document.documentElement.dataset.cookieConsent = analytics || marketing ? "optional" : "necessary-only";
  window.dispatchEvent(new CustomEvent("bluemind:cookie-consent-changed", { detail: next }));
  return next;
}

export function CookieSettingsButton({ label }: { label: string }) {
  return <button className={styles.settingsLink} type="button" onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}>{label}</button>;
}

export default function CookieConsent() {
  const { locale } = useLocalization();
  const copy = cookieConsentCopy[locale];
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    if (stored) {
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
      document.documentElement.dataset.cookieConsent = stored.analytics || stored.marketing ? "optional" : "necessary-only";
    } else setVisible(true);
    const openSettings = () => {
      const current = readConsent();
      setConsent(current);
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setCustomizing(true);
      setVisible(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  function finish(nextAnalytics: boolean, nextMarketing: boolean) {
    const next = saveConsent(nextAnalytics, nextMarketing);
    setConsent(next);
    setVisible(false);
    setCustomizing(false);
  }

  if (!visible) return null;
  if (customizing) return <div className={styles.dialog} role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setCustomizing(false); }}>
    <section className={styles.dialogCard} role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title" dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate>
      <div className={styles.dialogHeader}><h2 id="cookie-settings-title">{copy.settingsTitle}</h2><button className={styles.closeButton} type="button" onClick={() => setCustomizing(false)} aria-label={copy.close}>×</button></div>
      <div className={styles.options}>
        <div className={styles.option}><input type="checkbox" checked disabled id="cookie-necessary" /><div><label htmlFor="cookie-necessary">{copy.necessary}</label><p>{copy.necessaryDescription}</p></div></div>
        <div className={styles.option}><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} id="cookie-analytics" /><div><label htmlFor="cookie-analytics">{copy.analytics}</label><p>{copy.analyticsDescription}</p></div></div>
        <div className={styles.option}><input type="checkbox" checked={marketing} onChange={event => setMarketing(event.target.checked)} id="cookie-marketing" /><div><label htmlFor="cookie-marketing">{copy.marketing}</label><p>{copy.marketingDescription}</p></div></div>
      </div>
      <div className={styles.actions}><button className={styles.primary} type="button" onClick={() => finish(analytics, marketing)}>{copy.save}</button></div>
    </section>
  </div>;
  return <aside className={styles.banner} role="region" aria-label={copy.title} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate>
    <h2>{copy.title}</h2><p>{copy.description}</p>
    <div className={styles.actions}>
      <button className={styles.primary} type="button" onClick={() => finish(true, true)}>{copy.acceptAll}</button>
      <button className={styles.secondary} type="button" onClick={() => finish(false, false)}>{copy.rejectAll}</button>
      <button className={styles.secondary} type="button" onClick={() => setCustomizing(true)}>{copy.customize}</button>
    </div>
  </aside>;
}

