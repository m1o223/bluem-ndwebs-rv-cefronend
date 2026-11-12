"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Home, Sparkles, MessageCircle, Settings } from "lucide-react";
import Image from "next/image";
import { BrandLockup } from "../brand-lockup";
import { useLocalization } from "../localization-provider";
import { type Customer, type CustomerPage } from "../../app/lib/customer/routes";
import { customerCopy } from "./copy";
import styles from "./customer.module.css";
import WorkspaceContent from "./workspace-content";
import { workspaceCopy } from "./workspace-copy";
import type { Overview } from "./workspace-types";
import TextActionLabel from "../text-action-label";
import SessionRecovery from "./session-recovery";
import ChatWorkspace from "../../app/ask-ai/chat-workspace";
import LanguageSelector from "../language-selector";
const demoOverview: Overview = {
  profile: { fullName: "", customerType: null, companyName: "", companyNumber: "", preferences: { project: false, team: false, billing: false, email: false }, loginMethods: [] },
  project: null,
  notifications: [],
};
export default function CustomerShell({ user, page }: { user: Customer; page: CustomerPage }) {
  const { locale } = useLocalization();
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
  if (isAi) return <div ref={shell} className={`${styles.app} ${styles.aiApp}`} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate>
    <div className={styles.aiFullMain}>
      <ChatWorkspace available account accountFullScreen />
    </div>
  </div>;
  const accountLabel = text.account.split(" /")[0];
  return <div ref={shell} className={styles.app} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate>
    <header className={styles.header} data-account-header="true">
      <Link href="/dashboard" aria-label="BlueMind"><BrandLockup serviceName="WEB SERVICE" solidLogo className={styles.brand} textClassName={styles.brandText} serviceClassName={styles.customerService} logoClassName={styles.logo} /></Link>
      <div className={styles.headerActions}>
        <nav className={styles.desktopNav} aria-label={text.accountNavigation}>
          <Link href="/dashboard" aria-current={page === "home" ? "page" : undefined}><Home size={18} aria-hidden="true" /><TextActionLabel underline={false}>{text.home}</TextActionLabel></Link>
          <Link href="/blue-mind-ai"><Sparkles size={18} aria-hidden="true" /><TextActionLabel underline={false}>{text.ai}</TextActionLabel></Link>
          <Link href="/notifications" aria-current={page === "notifications" ? "page" : undefined}><MessageCircle size={18} aria-hidden="true" /><TextActionLabel underline={false}>{text.messages}</TextActionLabel></Link>
          <Link href="/account" aria-current={page === "account" ? "page" : undefined}><Settings size={18} aria-hidden="true" /><TextActionLabel underline={false}>{accountLabel}</TextActionLabel></Link>
        </nav>
        <LanguageSelector rootClassName={styles.languageSelector} buttonClassName={styles.languageButton} menuClassName={styles.languageMenu} resetKey={page} />
      </div>
    </header>
    <main className={styles.main} data-page-transition-surface>
      {!isAi && <Image className={styles.watermark} src="/images/brand/bluemind-original-logo-transparent.png" width={1065} height={1212} alt="" aria-hidden="true" />}
      {!isAi && !isHome && <h1 data-reveal-group="account-page-title">{pageTitle}</h1>}
      {page !== "notifications" && loadError ? <div role="alert"><p>{workspaceText.loadError}</p><button className={styles.secondary} onClick={() => setReload(value => value + 1)}><TextActionLabel underline={false}>{workspaceText.retry}</TextActionLabel></button></div> : page !== "notifications" && !overview ? <p role="status">{workspaceText.loading}</p> : <WorkspaceContent key={page} page={page} overview={overview || demoOverview} user={user} locale={locale} signOut={() => void signOut()} signingOut={busy} />}
      {notice && <p className={styles.error} role="alert">{text.error}</p>}
    </main>
  </div>;
}
