"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Mail } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocalization } from "../../components/localization-provider";
import { BrandLockup } from "../../components/brand-lockup";
import TextActionLabel from "../../components/text-action-label";
import { useGoogleSignIn } from "./use-google-sign-in";
import { useEmailSignIn } from "./use-email-sign-in";
import { authCopy } from "./auth-copy";
import { getStartedCopy } from "./get-started-copy";
import WebsiteOrbits from "./website-orbits";
import styles from "./sign-in.module.css";

type Mode = "welcome" | "register" | "login" | "recovery";

export default function SignInScreen() {
  const { locale } = useLocalization();
  const text = getStartedCopy[locale];
  const google = useGoogleSignIn();
  const email = useEmailSignIn();
  const [mode, setMode] = useState<Mode>("welcome");
  const recoveryFrom = useRef<Mode>("login");
  const title = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const availability = useRef<HTMLParagraphElement>(null);
  const busy = google.busy || email.busy;
  const authText = authCopy[locale];
  const returnTo = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("returnTo") || "";

  useEffect(() => {
    const clear = () => form.current?.reset();
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, []);

  function changeMode(next: Mode) {
    if (busy) return;
    if (next === "recovery") recoveryFrom.current = mode;
    form.current?.reset(); email.reset(); google.clearError(); setMode(next);
    // Focus the heading, rather than opening the mobile keyboard automatically.
    requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (mode === "login") void email.start(event.currentTarget);
    else availability.current?.focus();
  }

  const heading = mode === "login" ? text.signIn : mode === "recovery" ? text.recovery : text.start;
  const googleError = google.error === "cancelled" ? text.googleCancelled : google.error === "link_required" ? text.googleLink : google.error === "failed" ? text.googleFailed : text.googleUnavailable;
  const status = google.busy ? text.googleLoading : google.error ? googleError : mode === "login" && email.status !== "idle" ? authText[email.status] : "";

  return <section className={styles.page} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate aria-labelledby="sign-in-title">
    <Image className={styles.watermark} src="/images/brand/bluemind-original-logo-transparent.png" width={1065} height={1212} alt="" aria-hidden="true" sizes="(max-width: 620px) 80vw, 560px" />
    <div className={styles.topbar}>
      <Link href="/" className={styles.brand} aria-label="BlueMind Web Service home"><BrandLockup className={styles.brandLockup} logoClassName={styles.brandLogo} priority solidLogo /></Link>
      <Link href="/" className={styles.back}><ArrowLeft size={18} aria-hidden="true" /><TextActionLabel>{text.back}</TextActionLabel></Link>
    </div>
    <div className={styles.stage}>
      <WebsiteOrbits />
      <div className={styles.center}>
        <div className={styles.formArea} data-auth-card data-mode={mode}>
          <div className={styles.step} key={mode}>
            {mode !== "welcome" && <button type="button" className={styles.stepBack} disabled={busy} onClick={() => changeMode(mode === "recovery" ? recoveryFrom.current : "welcome")}><ArrowLeft size={15} aria-hidden="true" /><TextActionLabel>{text.back}</TextActionLabel></button>}
            <h1 id="sign-in-title" ref={title} tabIndex={-1}>{heading}</h1>
            {mode === "welcome" ? <>
              <p className={styles.subtitle}>{text.subtitle}</p>
              <div className={styles.providers}>
                <button type="button" disabled={busy} aria-busy={google.busy} data-active={google.busy} onClick={() => void google.start("", returnTo)}><Image src="/images/sign-in/google.png" width={20} height={20} alt="" /><TextActionLabel>{text.google}</TextActionLabel>{google.busy && <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />}</button>
                <div className={styles.bankid}><button type="button" disabled aria-describedby="bankid-note"><Image src="/images/sign-in/bankid.svg" width={28} height={26} alt="" /><span>{text.bankid}</span></button><small id="bankid-note">{text.bankidNote}</small></div>
                <button type="button" disabled={busy} onClick={() => changeMode("login")}><Mail className={styles.providerIcon} size={20} aria-hidden="true" /><TextActionLabel>{text.emailOption}</TextActionLabel></button>
              </div>
            </> : <>
              {mode === "recovery" && <p className={styles.subtitle}>{text.recoveryDescription}</p>}
              <form ref={form} onSubmit={submit} aria-busy={email.busy}>
                {mode === "register" && <>
                  <label htmlFor="sign-in-name">{text.name}</label><input id="sign-in-name" name="name" autoComplete="name" required maxLength={160} disabled={busy} />
                  <label htmlFor="sign-in-customer-type">{text.type}</label><select id="sign-in-customer-type" name="customerType" defaultValue="" disabled={busy}><option value="">{text.none}</option><option value="private">{text.private}</option><option value="company">{text.company}</option></select>
                </>}
                <label htmlFor="sign-in-email">{text.email}</label><input id="sign-in-email" name="email" type="email" autoComplete={mode === "register" ? "email" : "username"} inputMode="email" dir="ltr" spellCheck={false} required maxLength={254} disabled={busy} />
                {mode !== "recovery" && <><label htmlFor="sign-in-password">{text.password}</label><input id="sign-in-password" name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 15 : undefined} disabled={busy} /></>}
                <button type="submit" className={styles.primary} disabled={busy} aria-busy={email.busy}><TextActionLabel light>{mode === "register" ? text.start : mode === "login" ? text.signIn : text.reset}</TextActionLabel>{email.busy && <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />}</button>
              </form>
              {mode === "register" && <p className={styles.existing}>{text.existing} <button type="button" onClick={() => changeMode("login")}><TextActionLabel>{text.signIn}</TextActionLabel></button></p>}
              {mode === "login" && <p className={styles.existing}><button type="button" disabled={busy} onClick={() => changeMode("register")}><TextActionLabel>{locale === "ar" ? "إنشاء حساب" : locale === "sv" ? "Skapa konto" : "Create an account"}</TextActionLabel></button></p>}
              {mode !== "recovery" && <button type="button" className={styles.forgot} disabled={busy} onClick={() => changeMode("recovery")}><TextActionLabel>{text.forgot}</TextActionLabel></button>}
              {mode !== "login" && <p ref={availability} className={styles.availability} role="status" tabIndex={-1}>{mode === "register" ? text.registrationNote : text.recoveryNote}{mode === "recovery" && <> <Link href="/contact">{text.contact}</Link></>}</p>}
            </>}
            {(mode === "welcome" || mode === "login") && <p className={styles.notice} role="status" aria-live="polite" aria-atomic="true">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  </section>;
}
