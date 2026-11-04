"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
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
  const [notice, setNotice] = useState<"unavailable" | "recovery" | "provider" | null>(null);

  return <section className={styles.page} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate aria-labelledby="sign-in-title">
    <Image className={styles.watermark} src="/images/brand/bluemind-original-logo-transparent.png" width={1065} height={1212} alt="" aria-hidden="true" sizes="(max-width: 620px) 80vw, 560px" />
    <Link href="/" className={styles.back}><ArrowLeft size={18} aria-hidden="true" /><span>{text.back}</span></Link>
    <div className={styles.center}>
      <div className={styles.formArea}>
        <h1 id="sign-in-title">{text.title}</h1>
        <form onSubmit={event => { event.preventDefault(); setNotice("unavailable"); }}>
          <label htmlFor="sign-in-email">{text.email}</label>
          <input id="sign-in-email" type="email" autoComplete="email" inputMode="email" dir="ltr" required />
          <label htmlFor="sign-in-password">{text.password}</label>
          <input id="sign-in-password" type="password" autoComplete="current-password" required />
          <button type="button" className={styles.forgot} onClick={() => setNotice("recovery")}>{text.forgot}</button>
          <button type="submit" className={styles.primary}>{text.title}</button>
        </form>
        <div className={styles.divider}><span>{text.divider}</span></div>
        <div className={styles.providers}>
          <button type="button" onClick={() => setNotice("provider")}><Image src="/images/sign-in/google.png" width={20} height={20} alt="" /><span>{text.google}</span></button>
          <button type="button" onClick={() => setNotice("provider")}><Image src="/images/sign-in/bankid.svg" width={30} height={28} alt="" /><span>{text.bankid}</span></button>
        </div>
        <p className={styles.notice} role="status" aria-live="polite">{notice ? text[notice] : ""}</p>
      </div>
    </div>
  </section>;
}
