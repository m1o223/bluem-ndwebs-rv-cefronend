"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Home, Folder, Sparkles, MessageCircle, Settings, LogOut, Menu, X, UserRound } from "lucide-react";
import { BrandLockup } from "../brand-lockup";
import { useLocalization } from "../localization-provider";
import { customerRoutes, type Customer, type CustomerPage } from "../../app/lib/customer/routes";
import { customerCopy } from "./copy";
import styles from "./customer.module.css";

const icons = [Home, Folder, Sparkles, MessageCircle, Settings];
export default function CustomerShell({ user, page }: { user: Customer; page: CustomerPage }) {
  const { locale } = useLocalization();
  const text = customerCopy[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(false);
  const [verified, setVerified] = useState(false);
  const shell = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function check() {
      if (pending.current) return;
      setOpen(false);
      setVerified(false);
      try {
        const response = await fetch("/api/customer/session", { cache: "no-store", signal: controller.signal });
        const value = await response.json();
        if (!active || pending.current) return;
        if (!response.ok || value.user?.id !== user.id) { window.location.replace("/sign-in"); return; }
        setVerified(true);
        if (shell.current) shell.current.style.visibility = "";
      } catch { if (active && !pending.current) window.location.replace("/sign-in"); }
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
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [page, user.id]);

  function closeMenu() {
    setOpen(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => { dialog.current?.close(); toggle.current?.focus(); }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220);
  }
  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    dialog.current?.showModal();
    setOpen(true);
  }
  async function signOut() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setNotice(false);
    try {
      const response = await fetch("/api/customer/logout", { method: "POST", cache: "no-store" });
      if (!response.ok) throw new Error("logout");
      setVerified(false);
      const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("bluemind-customer-session") : null;
      channel?.postMessage("signed-out"); channel?.close();
      window.location.replace("/");
    } catch { pending.current = false; setBusy(false); setNotice(true); }
  }
  if (!verified) return <div className={styles.checking} role="status" aria-label={text.session} />;
  return <div ref={shell} className={styles.app} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate>
    <header className={styles.header}>
      <Link href="/dashboard" aria-label="BlueMind"><BrandLockup solidLogo className={styles.brand} logoClassName={styles.logo} /></Link>
      <div className={styles.controls}>
        <Link href="/account" className={styles.avatar} aria-label={text.account} title={user.displayName}><UserRound size={21} aria-hidden="true" /></Link>
        <button ref={toggle} type="button" className={styles.iconButton} aria-label={text.menu} aria-expanded={open} aria-controls="customer-menu" onClick={openMenu}><Menu size={23} aria-hidden="true" /></button>
      </div>
    </header>
    <main className={styles.main}><h1>{text[page]}</h1></main>
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
          return <Link href={route.href} key={route.href} prefetch={false} aria-current={page === route.key ? "page" : undefined} onClick={closeMenu}><Icon size={19} aria-hidden="true" /><span>{text[route.key]}</span></Link>;
        })}
      </nav>
      <button type="button" className={styles.signOut} disabled={busy} onClick={signOut}><LogOut size={19} aria-hidden="true" />{busy ? text.signingOut : text.signout}</button>
      {notice && <p className={styles.error} role="alert">{text.error}</p>}
    </dialog>
  </div>;
}
