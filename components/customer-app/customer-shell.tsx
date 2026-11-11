"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Home, Sparkles, MessageCircle, Settings } from "lucide-react";
import Image from "next/image";
import { BrandLockup } from "../brand-lockup";
import { useLocalization, type Locale } from "../localization-provider";
import { type Customer, type CustomerPage } from "../../app/lib/customer/routes";
import { customerCopy } from "./copy";
import styles from "./customer.module.css";
import WorkspaceContent from "./workspace-content";
import { workspaceCopy } from "./workspace-copy";
import type { Overview } from "./workspace-types";
import TextActionLabel from "../text-action-label";
import SessionRecovery from "./session-recovery";
import ChatWorkspace from "../../app/ask-ai/chat-workspace";
const demoOverview: Overview = {
  profile: { fullName: "", customerType: null, companyName: "", companyNumber: "", preferences: { project: false, team: false, billing: false, email: false }, loginMethods: [] },
  project: null,
  notifications: [],
};
const languageUi = {
  en: { selected: "Selected language: ", languages: "Languages" },
  sv: { selected: "Valt språk: ", languages: "Språk" },
  ar: { selected: "اللغة المختارة: ", languages: "اللغات" },
} as const;
export default function CustomerShell({ user, page }: { user: Customer; page: CustomerPage }) {
  const { locale, languages, setLocale } = useLocalization();
  const text = customerCopy[locale];
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [sessionRetry, setSessionRetry] = useState(0);
  const shell = useRef<HTMLDivElement>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const workspaceText = workspaceCopy[locale];
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageToggleRef = useRef<HTMLButtonElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = languages.find((language) => language.code === locale) ?? languages[0];
  const languageText = languageUi[locale];

  useEffect(() => {
    setLanguageOpen(false);
  }, [page]);

  useEffect(() => {
    if (!languageOpen) return;
    languageRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    const closeOutside = (event: MouseEvent) => {
      if (languageRef.current?.contains(event.target as Node)) return;
      setLanguageOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setLanguageOpen(false);
      languageToggleRef.current?.focus();
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [languageOpen]);

  useEffect(() => {
    const controller = new AbortController();
    setOverview(null); setLoadError(false);
    fetch("/api/customer/overview", { credentials: "same-origin", cache: "no-store", signal: controller.signal }).then(async response => {
      if (response.status === 401) { window.location.replace("/sign-in"); return; }
      if (!response.ok) throw new Error("overview");
      const data = await response.json();
      if (!data.profile || !Array.isArray(data.notifications)) throw new Error("overview");
      if (!controller.signal.aborted) setOverview(data);
    }).catch(() => { if (!controller.signal.aborted) setLoadError(true); });
    return () => controller.abort();
  }, [page, user.id, reload]);

  useEffect(() => {
    let active = true;
    let checking = false;
    const controller = new AbortController();
    async function check() {
      if (pending.current || checking) return;
      checking = true;
      setSessionError(false);
      try {
        const response = await fetch("/api/customer/session", { credentials: "same-origin", cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) });
        if (!active || pending.current) return;
        if (response.status === 401) { window.location.replace("/sign-in"); return; }
        if (!response.ok) throw new Error("session unavailable");
        const value = await response.json();
        if (!active || pending.current) return;
        if (!value.user?.id) throw new Error("invalid session response");
        if (value.user.id !== user.id) { window.location.replace("/dashboard"); return; }
        setVerified(true);
        if (shell.current) shell.current.style.visibility = "";
      } catch { if (active && !pending.current) { setVerified(false); setSessionError(true); } }
      finally { checking = false; }
    }
    const hide = () => { if (shell.current) shell.current.style.visibility = "hidden"; };
    const onShow = (event: PageTransitionEvent) => { if (event.persisted) void check(); };
    const onFocus = () => { void check(); };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("bluemind-customer-session") : null;
    if (channel) channel.onmessage = () => { if (!pending.current) { hide(); window.location.replace("/sign-in"); } };
    void check();
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", onShow);
    window.addEventListener("focus", onFocus);
    return () => {
      active = false; controller.abort(); channel?.close();
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("focus", onFocus);
    };
  }, [page, user.id, sessionRetry]);

  async function signOut() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setNotice(false);
    try {
      const response = await fetch("/api/customer/logout", { method: "POST", credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("logout");
      setVerified(false);
      const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("bluemind-customer-session") : null;
      channel?.postMessage("signed-out"); channel?.close();
      window.location.replace("/");
    } catch { pending.current = false; setBusy(false); setNotice(true); }
  }
  if (sessionError) return <SessionRecovery retry={() => setSessionRetry(value => value + 1)} />;
  if (!verified) return <div className={styles.checking} role="status" aria-label={text.session} />;
  const pageTitle = page === "notifications" ? workspaceText.notifications : text[page];
  const isAi = page === "ai";
  const isHome = page === "home";
  const accountLabel = text.account.split(" /")[0];
  const messagesLabel = locale === "sv" ? "Meddelanden" : locale === "ar" ? "\u0627\u0644\u0631\u0633\u0627\u0626\u0644" : "Messages";
  return <div ref={shell} className={styles.app} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate>
    <header className={styles.header}>
      <Link href="/dashboard" aria-label="BlueMind"><BrandLockup serviceName="WEB SERVICE" solidLogo className={styles.brand} textClassName={styles.brandText} serviceClassName={styles.customerService} logoClassName={styles.logo} /></Link>
      <div className={styles.headerActions}>
        <nav className={styles.desktopNav} aria-label="Account navigation">
          <Link href="/dashboard" aria-current={page === "home" ? "page" : undefined}><Home size={18} aria-hidden="true" /><TextActionLabel underline={false}>{text.home}</TextActionLabel></Link>
          <Link href="/blue-mind-ai" aria-current={page === "ai" ? "page" : undefined}><Sparkles size={18} aria-hidden="true" /><TextActionLabel underline={false}>{text.ai}</TextActionLabel></Link>
          <Link href="/notifications" aria-current={page === "notifications" ? "page" : undefined}><MessageCircle size={18} aria-hidden="true" /><TextActionLabel underline={false}>{messagesLabel}</TextActionLabel></Link>
          <Link href="/account" aria-current={page === "account" ? "page" : undefined}><Settings size={18} aria-hidden="true" /><TextActionLabel underline={false}>{accountLabel}</TextActionLabel></Link>
        </nav>
        <div className={styles.languageSelector} ref={languageRef}>
          <button
            ref={languageToggleRef}
            className={styles.languageButton}
            type="button"
            aria-label={`${languageText.selected}${selectedLanguage.nativeName}`}
            aria-haspopup="menu"
            aria-controls="customer-languages"
            aria-expanded={languageOpen}
            onClick={() => setLanguageOpen(open => !open)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setLanguageOpen(true);
              }
            }}
          >
            <Globe2 aria-hidden="true" size={18} strokeWidth={1.7} />
            <span>{selectedLanguage.short}</span>
            <ChevronDown aria-hidden="true" size={12} />
          </button>
          <div
            id="customer-languages"
            className={styles.languageMenu}
            role="menu"
            aria-label={languageText.languages}
            data-open={languageOpen}
            inert={!languageOpen}
            onKeyDown={(event) => {
              const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
              const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
              let next: number;
              if (event.key === "ArrowDown") next = (index + 1) % buttons.length;
              else if (event.key === "ArrowUp") next = (index + buttons.length - 1) % buttons.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = buttons.length - 1;
              else return;
              event.preventDefault();
              buttons[next]?.focus();
            }}
          >
            {languages.map(language => (
              <button
                key={language.code}
                type="button"
                role="menuitemradio"
                aria-checked={locale === language.code}
                data-selected={locale === language.code}
                onClick={() => {
                  setLocale(language.code as Locale);
                  setLanguageOpen(false);
                  languageToggleRef.current?.focus();
                }}
              >
                <span>{language.nativeName}</span>
                {locale === language.code ? <Check size={15} aria-hidden="true" /> : <small>{language.short}</small>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
    <main className={`${styles.main} ${isAi ? styles.aiMain : ""}`}>
      {!isAi && <Image className={styles.watermark} src="/images/brand/bluemind-original-logo-transparent.png" width={1065} height={1212} alt="" aria-hidden="true" />}
      {!isAi && !isHome && <h1>{pageTitle}</h1>}
      {isAi ? <ChatWorkspace available account /> : page !== "notifications" && loadError ? <div role="alert"><p>{workspaceText.loadError}</p><button className={styles.secondary} onClick={() => setReload(value => value + 1)}><TextActionLabel underline={false}>{workspaceText.retry}</TextActionLabel></button></div> : page !== "notifications" && !overview ? <p role="status">{workspaceText.loading}</p> : <WorkspaceContent key={page} page={page} overview={overview || demoOverview} user={user} locale={locale} signOut={() => void signOut()} signingOut={busy} />}
      {notice && <p className={styles.error} role="alert">{text.error}</p>}
    </main>
  </div>;
}
