"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useRef, type FormEvent } from "react";
import { useLocalization } from "../../components/localization-provider";
import styles from "./sign-in.module.css";
import { usePreviewInteraction } from "./use-preview-interaction";
import TextActionLabel from "../../components/text-action-label";

const copy = {
  en: { title: "Sign in", back: "Back", email: "Email", password: "Password", forgot: "Forgot password?", divider: "or continue with", google: "Continue with Google", bankid: "Continue with BankID", preview: "Design preview only. No information is sent or saved.", loading: "Previewing interaction...", finished: "Preview complete. You have not been signed in." },
  sv: { title: "Logga in", back: "Tillbaka", email: "E-post", password: "Lösenord", forgot: "Glömt lösenord?", divider: "eller fortsätt med", google: "Fortsätt med Google", bankid: "Fortsätt med BankID", preview: "Endast designförhandsvisning. Inga uppgifter skickas eller sparas.", loading: "Förhandsvisar interaktionen...", finished: "Förhandsvisningen är klar. Du är inte inloggad." },
  ar: { title: "تسجيل الدخول", back: "رجوع", email: "البريد الإلكتروني", password: "كلمة المرور", forgot: "نسيت كلمة المرور؟", divider: "أو المتابعة باستخدام", google: "المتابعة باستخدام Google", bankid: "المتابعة باستخدام BankID", preview: "معاينة للتصميم فقط. لا تُرسل المعلومات ولا تُحفظ.", loading: "جارٍ عرض التفاعل التجريبي...", finished: "انتهت المعاينة. لم يتم تسجيل الدخول." },
};

export default function SignInScreen() {
  const router = useRouter();
  const { locale } = useLocalization();
  const text = copy[locale];
  const { feedback, preview, busy } = usePreviewInteraction();
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const clear = () => form.current?.reset();
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, []);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    preview("email", () => {
      form.current?.reset();
      router.push("/dashboard-preview");
    });
  }

  return <section className={styles.page} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate aria-labelledby="sign-in-title">
    <Image className={styles.watermark} src="/images/brand/bluemind-original-logo-transparent.png" width={1065} height={1212} alt="" aria-hidden="true" sizes="(max-width: 620px) 80vw, 560px" />
    <Link href="/" className={styles.back}><ArrowLeft size={18} aria-hidden="true" /><TextActionLabel>{text.back}</TextActionLabel></Link>
    <div className={styles.center}>
      <div className={styles.formArea}>
        <h1 id="sign-in-title">{text.title}</h1>
        <form ref={form} onSubmit={signIn} noValidate autoComplete="off" aria-describedby="sign-in-preview" aria-busy={busy}>
          <label htmlFor="sign-in-email">{text.email}</label>
          <input id="sign-in-email" type="email" autoComplete="off" inputMode="email" dir="ltr" spellCheck={false} />
          <label htmlFor="sign-in-password">{text.password}</label>
          <input id="sign-in-password" type="password" autoComplete="off" />
          <button type="button" className={styles.forgot} disabled={busy} data-active={feedback?.action === "recovery"} onClick={() => preview("recovery")}><TextActionLabel>{text.forgot}</TextActionLabel></button>
          <label htmlFor="sign-in-customer-type">{locale === "ar" ? "نوع العميل (اختياري)" : locale === "sv" ? "Kundtyp (valfritt)" : "Customer type (optional)"}</label>
          <select id="sign-in-customer-type" className={styles.customerType} defaultValue=""><option value="">{locale === "ar" ? "غير محدد" : locale === "sv" ? "Inte valt" : "Not selected"}</option><option value="private">{locale === "ar" ? "فرد" : locale === "sv" ? "Privatperson" : "Private person"}</option><option value="company">{locale === "ar" ? "شركة" : locale === "sv" ? "Företag" : "Company"}</option></select>
          <button type="submit" className={styles.primary} disabled={busy} aria-busy={busy && feedback?.action === "email"} data-active={feedback?.action === "email"}><TextActionLabel light>{text.title}</TextActionLabel>{busy && feedback?.action === "email" && <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />}</button>
        </form>
        <div className={styles.divider}><span>{text.divider}</span></div>
        <div className={styles.providers}>
          <button type="button" disabled={busy} aria-busy={busy && feedback?.action === "google"} data-active={feedback?.action === "google"} onClick={() => preview("google")}><Image src="/images/sign-in/google.png" width={20} height={20} alt="" /><TextActionLabel>{text.google}</TextActionLabel>{busy && feedback?.action === "google" && <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />}</button>
          <button type="button" disabled={busy} aria-busy={busy && feedback?.action === "bankid"} data-active={feedback?.action === "bankid"} onClick={() => preview("bankid")}><Image src="/images/sign-in/bankid.svg" width={30} height={28} alt="" /><TextActionLabel>{text.bankid}</TextActionLabel>{busy && feedback?.action === "bankid" && <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />}</button>
        </div>
        <p id="sign-in-preview" className={styles.previewNote}>{text.preview}</p>
        <p className={styles.notice} role="status" aria-live="polite" aria-atomic="true">{busy ? text.loading : feedback ? text.finished : ""}</p>
      </div>
    </div>
  </section>;
}
