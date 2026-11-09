"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { BrandLockup } from "./brand-lockup";
import { useLocalization } from "./localization-provider";
import styles from "./site-menu-page.module.css";

const links = [
  ["/services", "Services"],
  ["/about", "About Us"],
  ["/how-we-work", "How We Work"],
  ["/templates", "Website Concepts"],
  ["/contact", "Contact Us"],
  ["/ask-ai", "BlueMind AI"],
] as const;

export default function SiteMenuPage() {
  const { locale } = useLocalization();
  const rtl = locale === "ar";
  const labels = rtl
    ? { back: "العودة", eyebrow: "التنقّل", title: "استكشف BlueMind", intro: "كل صفحات الموقع في مكان واحد.", links: ["الخدمات", "من نحن", "كيف نعمل", "نماذج المواقع", "تواصل معنا", "BlueMind AI"] }
    : locale === "sv"
      ? { back: "Tillbaka", eyebrow: "Navigering", title: "Utforska BlueMind", intro: "Alla webbplatsens sidor på ett ställe.", links: ["Tjänster", "Om oss", "Så arbetar vi", "Webbplatskoncept", "Kontakta oss", "BlueMind AI"] }
      : { back: "Back", eyebrow: "Navigation", title: "Explore BlueMind", intro: "Every main page, in one clear place.", links: links.map(([, label]) => label) };

  return (
    <main className={styles.page} dir={rtl ? "rtl" : "ltr"}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="BlueMind Web Service home"><BrandLockup solidLogo priority /></Link>
        <Link href="/" className={styles.back}><ChevronLeft size={17} aria-hidden="true" />{labels.back}</Link>
      </header>
      <section className={styles.content}>
        <p className={styles.eyebrow}>{labels.eyebrow}</p>
        <h1>{labels.title}</h1>
        <p className={styles.intro}>{labels.intro}</p>
        <nav className={styles.linkList} aria-label={labels.eyebrow}>
          {links.map(([href], index) => <Link key={href} href={href}><span>{labels.links[index]}</span><ArrowRight size={20} aria-hidden="true" /></Link>)}
        </nav>
      </section>
    </main>
  );
}
