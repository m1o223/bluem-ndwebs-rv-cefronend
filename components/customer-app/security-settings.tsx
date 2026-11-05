"use client";
import { useRef, useState, type FormEvent } from "react";
import { authCopy } from "../../app/sign-in/auth-copy";
import styles from "./customer.module.css";

export default function SecuritySettings({ locale, passwordLogin }: { locale: keyof typeof authCopy; passwordLogin: boolean }) {
  const text = authCopy[locale];
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"passwordError" | "passwordSaved" | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget, values = new FormData(form);
    pending.current = true; setBusy(true); setStatus(null);
    try {
      const response = await fetch("/api/customer/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: values.get("currentPassword"), newPassword: values.get("newPassword") }), signal: AbortSignal.timeout(20000) });
      if (response.status === 401) { window.location.replace("/sign-in"); return; }
      if (!response.ok) throw new Error("password");
      form.reset(); setStatus("passwordSaved");
      const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("bluemind-customer-session") : null;
      channel?.postMessage("signed-out"); channel?.close();
      window.location.replace("/sign-in");
    } catch { setStatus("passwordError"); }
    finally { pending.current = false; setBusy(false); }
  }
  return <section className={styles.section}><h2>{text.security}</h2>{passwordLogin ? <form onSubmit={submit} aria-busy={busy}>
    <div className={styles.formGrid}>
      <label className={styles.field}><span>{text.currentPassword}</span><input name="currentPassword" type="password" autoComplete="current-password" required disabled={busy} /></label>
      <label className={styles.field}><span>{text.newPassword}</span><input name="newPassword" type="password" autoComplete="new-password" minLength={15} required disabled={busy} aria-describedby="password-help" /></label>
    </div><p id="password-help" className={styles.muted}>{text.passwordHelp}</p>
    <button className={styles.secondary} disabled={busy}>{text.changePassword}</button><p role={status === "passwordError" ? "alert" : "status"}>{status ? text[status] : ""}</p>
  </form> : <p className={styles.muted}>{text.googleSecurity}</p>}</section>;
}
