"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Folder } from "lucide-react";
import { BrandLockup } from "../../components/brand-lockup";
import { useLocalization } from "../../components/localization-provider";
import TextActionLabel from "../../components/text-action-label";
import customer from "../../components/customer-app/customer.module.css";
import styles from "./preview.module.css";

const copy = {
  en: { title: "Dashboard", back: "Back", preview: "Design preview", note: "You are viewing a preview, not a signed-in account. No information has been sent or saved.", project: "My Project", empty: "No project data in this preview." },
  sv: { title: "Översikt", back: "Tillbaka", preview: "Designförhandsvisning", note: "Du ser en förhandsvisning, inte ett inloggat konto. Inga uppgifter har skickats eller sparats.", project: "Mitt projekt", empty: "Inga projektuppgifter i denna förhandsvisning." },
  ar: { title: "لوحة العميل", back: "رجوع", preview: "معاينة التصميم", note: "هذه معاينة وليست حسابًا مسجل الدخول. لم تُرسل أي معلومات ولم تُحفظ.", project: "مشروعي", empty: "لا توجد بيانات مشروع في هذه المعاينة." },
};

export default function DashboardPreview() {
  const { locale } = useLocalization();
  const text = copy[locale];
  return <div className={customer.app} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate>
    <header className={customer.header}>
      <Link href="/" aria-label="BlueMind Web Service"><BrandLockup solidLogo className={customer.brand} logoClassName={customer.logo} /></Link>
      <Link href="/sign-in" className={customer.textLink}><ArrowLeft size={18} aria-hidden="true" /><TextActionLabel>{text.back}</TextActionLabel></Link>
    </header>
    <main className={`${customer.main} ${styles.enter}`}>
      <Image className={customer.watermark} src="/images/brand/bluemind-original-logo-transparent.png" width={1065} height={1212} alt="" aria-hidden="true" />
      <p className={customer.muted}>{text.preview}</p>
      <h1>{text.title}</h1>
      <p className={customer.welcome}>{text.note}</p>
      <section className={customer.section} aria-labelledby="preview-project-title">
        <h2 id="preview-project-title">{text.project}</h2>
        <div className={customer.empty}><Folder size={28} strokeWidth={1.5} aria-hidden="true" /><p>{text.empty}</p></div>
      </section>
    </main>
  </div>;
}
