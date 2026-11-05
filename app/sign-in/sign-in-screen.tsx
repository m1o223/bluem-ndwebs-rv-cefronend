"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocalization } from "../../components/localization-provider";
import styles from "./sign-in.module.css";
import { usePreviewInteraction } from "./use-preview-interaction";
import TextActionLabel from "../../components/text-action-label";
import { useGoogleSignIn } from "./use-google-sign-in";
import { useEmailSignIn } from "./use-email-sign-in";
import { authCopy } from "./auth-copy";

const googleCopy = {
  en: { note: "Email and BankID are design previews. Google sign-in uses your Google account when configured.", loading: "Connecting to Google...", unavailable: "Google sign-in is not configured yet. Please try again later.", failed: "Google sign-in could not be completed. Please try again.", cancelled: "Google sign-in was cancelled.", link_required: "This email already has a BlueMind account. Contact our team to securely link Google." },
  sv: { note: "E-post och BankID är designförhandsvisningar. Google-inloggning använder ditt Google-konto när den är konfigurerad.", loading: "Ansluter till Google...", unavailable: "Google-inloggning är inte konfigurerad än. Försök igen senare.", failed: "Google-inloggningen kunde inte slutföras. Försök igen.", cancelled: "Google-inloggningen avbröts.", link_required: "Den här e-postadressen har redan ett BlueMind-konto. Kontakta vårt team för att länka Google säkert." },
  ar: { note: "البريد الإلكتروني وBankID معاينة للتصميم. يستخدم تسجيل الدخول بجوجل حسابك على Google بعد إكمال الإعداد.", loading: "جارٍ الاتصال بـ Google...", unavailable: "لم يكتمل إعداد تسجيل الدخول بجوجل بعد. يرجى المحاولة لاحقًا.", failed: "تعذر إكمال تسجيل الدخول بجوجل. يرجى المحاولة مجددًا.", cancelled: "تم إلغاء تسجيل الدخول بجوجل.", link_required: "يوجد حساب BlueMind بهذا البريد بالفعل. تواصل مع فريقنا لربط Google بشكل آمن." },
};

const copy = {
  en: { title: "Sign in", back: "Back", email: "Email", password: "Password", forgot: "Forgot password?", divider: "or continue with", google: "Continue with Google", bankid: "Continue with BankID", preview: "Design preview only. No information is sent or saved.", loading: "Previewing interaction...", finished: "Preview complete. You have not been signed in." },
  sv: { title: "Logga in", back: "Tillbaka", email: "E-post", password: "Lösenord", forgot: "Glömt lösenord?", divider: "eller fortsätt med", google: "Fortsätt med Google", bankid: "Fortsätt med BankID", preview: "Endast designförhandsvisning. Inga uppgifter skickas eller sparas.", loading: "Förhandsvisar interaktionen...", finished: "Förhandsvisningen är klar. Du är inte inloggad." },
  ar: { title: "تسجيل الدخول", back: "رجوع", email: "البريد الإلكتروني", password: "كلمة المرور", forgot: "نسيت كلمة المرور؟", divider: "أو المتابعة باستخدام", google: "المتابعة باستخدام Google", bankid: "المتابعة باستخدام BankID", preview: "معاينة للتصميم فقط. لا تُرسل المعلومات ولا تُحفظ.", loading: "جارٍ عرض التفاعل التجريبي...", finished: "انتهت المعاينة. لم يتم تسجيل الدخول." },
};

export default function SignInScreen() {
  const { locale } = useLocalization();
  const text = copy[locale];
  const { feedback, preview, busy: previewBusy } = usePreviewInteraction();
  const google = useGoogleSignIn();
  const email = useEmailSignIn();
  const [recovery, setRecovery] = useState(false);
  const authText = authCopy[locale];
  const busy = previewBusy || google.busy || email.busy;
  const googleText = googleCopy[locale];
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const clear = () => form.current?.reset();
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, []);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setRecovery(false);
    void email.start(event.currentTarget);
  }

  return <section className={styles.page} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate aria-labelledby="sign-in-title">
    <Image className={styles.watermark} src="/images/brand/bluemind-original-logo-transparent.png" width={1065} height={1212} alt="" aria-hidden="true" sizes="(max-width: 620px) 80vw, 560px" />
    <Link href="/" className={styles.back}><ArrowLeft size={18} aria-hidden="true" /><TextActionLabel>{text.back}</TextActionLabel></Link>
    <div className={styles.center}>
      <div className={styles.formArea}>
        <h1 id="sign-in-title">{text.title}</h1>
        <form ref={form} onSubmit={signIn} aria-describedby="sign-in-preview" aria-busy={busy}>
          <label htmlFor="sign-in-email">{text.email}</label>
          <input id="sign-in-email" name="email" type="email" autoComplete="username" inputMode="email" dir="ltr" spellCheck={false} required maxLength={254} disabled={busy} />
          <label htmlFor="sign-in-password">{text.password}</label>
          <input id="sign-in-password" name="password" type="password" autoComplete="current-password" required disabled={busy} />
          <button type="button" className={styles.forgot} disabled={busy} onClick={() => setRecovery(true)}><TextActionLabel>{text.forgot}</TextActionLabel></button>
          <label htmlFor="sign-in-customer-type">{locale === "ar" ? "نوع العميل (اختياري)" : locale === "sv" ? "Kundtyp (valfritt)" : "Customer type (optional)"}</label>
          <select id="sign-in-customer-type" className={styles.customerType} defaultValue=""><option value="">{locale === "ar" ? "غير محدد" : locale === "sv" ? "Inte valt" : "Not selected"}</option><option value="private">{locale === "ar" ? "فرد" : locale === "sv" ? "Privatperson" : "Private person"}</option><option value="company">{locale === "ar" ? "شركة" : locale === "sv" ? "Företag" : "Company"}</option></select>
          <button type="submit" className={styles.primary} disabled={busy} aria-busy={email.busy} data-active={email.busy}><TextActionLabel light>{text.title}</TextActionLabel>{email.busy && <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />}</button>
        </form>
        <div className={styles.divider}><span>{text.divider}</span></div>
        <div className={styles.providers}>
          <button type="button" disabled={busy} aria-busy={google.busy} data-active={google.busy} onClick={() => { const choice = form.current?.querySelector<HTMLSelectElement>("select")?.value || ""; void google.start(choice); }}><Image src="/images/sign-in/google.png" width={20} height={20} alt="" /><TextActionLabel>{text.google}</TextActionLabel>{google.busy && <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />}</button>
          <button type="button" disabled={busy} aria-busy={busy && feedback?.action === "bankid"} data-active={feedback?.action === "bankid"} onClick={() => preview("bankid")}><Image src="/images/sign-in/bankid.svg" width={30} height={28} alt="" /><TextActionLabel>{text.bankid}</TextActionLabel>{busy && feedback?.action === "bankid" && <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />}</button>
        </div>
        <p id="sign-in-preview" className={styles.previewNote}>{authText.note}</p>
        <p className={styles.notice} role="status" aria-live="polite" aria-atomic="true">{google.busy ? googleText.loading : email.status !== "idle" ? authText[email.status] : previewBusy ? text.loading : google.error ? googleText[google.error as "unavailable" | "failed" | "cancelled" | "link_required"] : recovery ? authText.recovery : feedback ? text.finished : ""}</p>
      </div>
    </div>
  </section>;
}
