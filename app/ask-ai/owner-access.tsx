"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X, LogOut } from "lucide-react";
import { BlueMindLogo } from "../../components/blue-mind-logo";
import ChatWorkspace from "./chat-workspace";
import styles from "./owner-access.module.css";

export default function OwnerAccess() {
  const [state, setState] = useState<"loading" | "login" | "ready">("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ai/session", { cache: "no-store", signal: controller.signal }).then(response => setState(response.ok ? "ready" : "login"))
      .catch(() => { if (!controller.signal.aborted) setState("login"); });
    return () => controller.abort();
  }, []);
  async function signOut() {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const response = await fetch("/api/ai/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      setState("login"); setError("");
    } catch { setError("Unable to sign out. Please try again."); }
    finally { lock.current = false; setBusy(false); }
  }
  if (state === "ready") return <><ChatWorkspace available onUnauthorized={() => { setState("login"); setError("Your testing session expired. Please sign in again."); }} /><div className={styles.session}><span>Private owner testing</span><button onClick={signOut} disabled={busy} title="Sign out of AI testing" aria-label="Sign out of AI testing"><LogOut size={18} /></button>{error && <span role="alert">{error}</span>}</div></>;
  return <main className={styles.page} data-no-translate>
    <Link href="/" className={styles.close} aria-label="Close"><X size={22} /></Link>
    {state === "loading" ? <p role="status">Checking access...</p> : <form className={styles.form} onSubmit={async event => {
      event.preventDefault();
      if (lock.current) return;
      lock.current = true; setBusy(true); setError("");
      const form = event.currentTarget;
      const data = new FormData(form);
      try {
        const response = await fetch("/api/ai/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
        if (!response.ok) { setError(response.status === 429 ? "Too many attempts. Please wait a minute." : response.status === 401 ? "Unable to sign in with these credentials." : "Private testing is temporarily unavailable. Please try again."); return; }
        form.reset(); setState("ready");
      } catch { setError("Unable to connect. Please try again."); }
      finally { lock.current = false; setBusy(false); }
    }}>
      <BlueMindLogo solid className={styles.logo} />
      <h1>BlueMind AI</h1>
      <p>Private owner testing. Public access is not available.</p>
      <label>Workspace email<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
      <label>Owner password<input name="password" type="password" autoComplete="current-password" required maxLength={128} /></label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
    </form>}
  </main>;
}
