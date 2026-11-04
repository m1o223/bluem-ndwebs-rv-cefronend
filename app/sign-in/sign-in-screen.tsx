"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { useLocalization } from "../../components/localization-provider";
import styles from "./sign-in.module.css";

const copy = {
  en: { title: "Sign in", back: "Back", email: "Email", password: "Password", forgot: "Forgot password?", divider: "or continue with", google: "Continue with Google", bankid: "Continue with BankID", unavailable: "Sign in is not available yet. Your details have not been sent.", recovery: "Password recovery is not available yet.", provider: "This sign-in method is not connected yet." },
  sv: { title: "Logga in", back: "Tillbaka", email: "E-post", password: "Lösenord", forgot: "Glömt lösenord?", divider: "eller fortsätt med", google: "Fortsätt med Google", bankid: "Fortsätt med BankID", unavailable: "Inloggning är inte tillgänglig ännu. Dina uppgifter har inte skickats.", recovery: "Återställning av lösenord är inte tillgänglig ännu.", provider: "Den här inloggningsmetoden är inte ansluten ännu." },
  ar: { title: "تسجيل الدخول", back: "رجوع", email: "البريد الإلكتروني", password: "كلمة المرور", forgot: "نسيت كلمة المرور؟", divider: "أو المتابعة باستخدام", google: "المتابعة باستخدام Google", bankid: "المتابعة باستخدام BankID", unavailable: "تسجيل الدخول غير متاح بعد. لم يتم إرسال بياناتك.", recovery: "استعادة كلمة المرور غير متاحة بعد.", provider: "طريقة تسجيل الدخول هذه غير مرتبطة بعد." },
};

export default function SignInScreen() {
  const { locale } = useLocalization();
  const text = copy[locale];
  const [notice, setNotice] = useState<"recovery" | "provider" | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const errors = {
    en: { credentials: "Email or password is incorrect.", unavailable: "Sign in is temporarily unavailable. Please try again.", rate: "Too many attempts. Please try again in 15 minutes.", invalid: "Please check your email and password.", busy: "Signing in..." },
    sv: { credentials: "E-post eller lösenord är felaktigt.", unavailable: "Inloggning är tillfälligt otillgänglig. Försök igen.", rate: "För många försök. Försök igen om 15 minuter.", invalid: "Kontrollera din e-post och ditt lösenord.", busy: "Loggar in..." },
    ar: { credentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", unavailable: "تسجيل الدخول غير متاح مؤقتًا. حاول مجددًا.", rate: "محاولات كثيرة. حاول مجددًا بعد 15 دقيقة.", invalid: "تحقق من البريد الإلكتروني وكلمة المرور.", busy: "جارٍ تسجيل الدخول..." },
  }[locale];
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; setBusy(true); setNotice(null); setError("");
    const form = event.currentTarget;
    const email = form.querySelector<HTMLInputElement>("#sign-in-email")!.value;
    const password = form.querySelector<HTMLInputElement>("#sign-in-password")!.value;
    try {
      const response = await fetch("/api/customer/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(20000) });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.code === "credentials" ? errors.credentials : data.code === "rate" ? errors.rate : data.code === "invalid" ? errors.invalid : errors.unavailable);
        return;
      }
      form.reset();
      window.location.replace("/dashboard");
    } catch { setError(errors.unavailable); }
    finally { pending.current = false; setBusy(false); }
  }

  return <section className={styles.page} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate aria-labelledby="sign-in-title">
    <Image className={styles.watermark} src="/images/brand/bluemind-original-logo-transparent.png" width={1065} height={1212} alt="" aria-hidden="true" sizes="(max-width: 620px) 80vw, 560px" />
    <Link href="/" className={styles.back}><ArrowLeft size={18} aria-hidden="true" /><span>{text.back}</span></Link>
    <div className={styles.center}>
      <div className={styles.formArea}>
        <h1 id="sign-in-title">{text.title}</h1>
        <form onSubmit={signIn} aria-busy={busy}>
          <label htmlFor="sign-in-email">{text.email}</label>
          <input id="sign-in-email" type="email" autoComplete="email" inputMode="email" dir="ltr" required />
          <label htmlFor="sign-in-password">{text.password}</label>
          <input id="sign-in-password" type="password" autoComplete="current-password" required />
          <button type="button" className={styles.forgot} onClick={() => setNotice("recovery")}>{text.forgot}</button>
          <button type="submit" className={styles.primary} disabled={busy}>{busy ? errors.busy : text.title}</button>
        </form>
        <div className={styles.divider}><span>{text.divider}</span></div>
        <div className={styles.providers}>
          <button type="button" onClick={() => setNotice("provider")}><Image src="/images/sign-in/google.png" width={20} height={20} alt="" /><span>{text.google}</span></button>
          <button type="button" onClick={() => setNotice("provider")}><Image src="/images/sign-in/bankid.svg" width={30} height={28} alt="" /><span>{text.bankid}</span></button>
        </div>
        <p className={styles.notice} role="status" aria-live="polite">{notice ? text[notice] : error}</p>
      </div>
    </div>
  </section>;
}
