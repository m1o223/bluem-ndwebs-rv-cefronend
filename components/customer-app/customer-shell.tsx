"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Home, Folder, Sparkles, MessageCircle, Settings, LogOut, Menu, X, UserRound, Bell } from "lucide-react";
import Image from "next/image";
import { BrandLockup } from "../brand-lockup";
import { useLocalization } from "../localization-provider";
import { customerRoutes, type Customer, type CustomerPage } from "../../app/lib/customer/routes";
import { customerCopy } from "./copy";
import styles from "./customer.module.css";
import WorkspaceContent from "./workspace-content";
import { workspaceCopy } from "./workspace-copy";
import type { Overview } from "./workspace-types";
import TextActionLabel from "../text-action-label";
import SessionRecovery from "./session-recovery";
import { useCustomerMenu } from "./menu-state";

const icons = [Home, Folder, Sparkles, MessageCircle, Settings];
const demoOverview: Overview = {
  profile: { fullName: "", customerType: null, companyName: "", companyNumber: "", preferences: { project: false, team: false, billing: false, email: false }, loginMethods: [] },
  project: null,
  notifications: [],
};
export default function CustomerShell({ user, page }: { user: Customer; page: CustomerPage }) {
  const { locale } = useLocalization();
  const text = customerCopy[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const { open, setOpen } = useCustomerMenu();
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

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!verified || sessionError || !element) return;
    if (open) {
      if (!element.open) element.showModal();
      return;
    }
    if (!element.open) return;
    const timer = setTimeout(() => {
      element.close();
      toggle.current?.focus();
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220);
    return () => clearTimeout(timer);
  }, [open, verified, sessionError]);

  function closeMenu() { setOpen(false); }
  function openMenu() { setOpen(true); }
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
  return <div ref={shell} className={styles.app} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate>
    <header className={styles.header}>
      <Link href="/dashboard" aria-label="BlueMind"><BrandLockup solidLogo className={styles.brand} logoClassName={styles.logo} /></Link>
      <div className={styles.controls}>
        <Link href="/notifications" className={styles.iconButton} aria-label={workspaceText.notifications} title={workspaceText.notifications}><Bell size={21} aria-hidden="true" />{overview?.notifications.some(item => !item.read) && <span className={styles.unread} />}</Link>
        <Link href="/account" className={styles.avatar} aria-label={text.account} title={user.displayName}><UserRound size={21} aria-hidden="true" /></Link>
        <button ref={toggle} type="button" className={styles.iconButton} aria-label={text.menu} aria-expanded={open} aria-controls="customer-menu" onClick={openMenu}><Menu size={23} aria-hidden="true" /></button>
      </div>
    </header>
    <main className={styles.main}>
      <Image className={styles.watermark} src="/images/brand/bluemind-original-logo-transparent.png" width={1065} height={1212} alt="" aria-hidden="true" />
      <h1>{pageTitle}</h1>
      {page !== "notifications" && loadError ? <div role="alert"><p>{workspaceText.loadError}</p><button className={styles.secondary} onClick={() => setReload(value => value + 1)}><TextActionLabel>{workspaceText.retry}</TextActionLabel></button></div> : page !== "notifications" && !overview ? <p role="status">{workspaceText.loading}</p> : <WorkspaceContent key={page} page={page} overview={overview || demoOverview} user={user} locale={locale} signOut={() => void signOut()} signingOut={busy} />}
      {notice && <p className={styles.error} role="alert">{text.error}</p>}
    </main>
    <dialog ref={dialog} id="customer-menu" className={styles.drawer} data-open={open} aria-label={text.menu} onCancel={event => { event.preventDefault(); closeMenu(); }} onClick={event => {
      if (event.target === event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeMenu();
      }
    }}>
      <div className={styles.drawerHeader}><span>BlueMind</span><button className={styles.iconButton} type="button" aria-label={text.close} onClick={closeMenu}><X size={22} aria-hidden="true" /></button></div>
      <nav aria-label={text.menu}>
        {customerRoutes.map((route, index) => {
          const Icon = icons[index];
          return <Link href={route.href} key={route.href} prefetch={false} aria-current={page === route.key ? "page" : undefined}><Icon size={19} aria-hidden="true" /><TextActionLabel>{text[route.key]}</TextActionLabel></Link>;
        })}
      </nav>
      <button type="button" className={styles.signOut} disabled={busy} onClick={signOut}><LogOut size={19} aria-hidden="true" /><TextActionLabel>{busy ? text.signingOut : text.signout}</TextActionLabel></button>
      {notice && <p className={styles.error} role="alert">{text.error}</p>}
    </dialog>
  </div>;
}
