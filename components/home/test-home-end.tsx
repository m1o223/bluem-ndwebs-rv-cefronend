"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocalization, type Locale } from "../localization-provider";
import { BrandLockup } from "../brand-lockup";
import styles from "./test-home-end.module.css";

type LinkItem = { href: string; label: string };
type EndCopy = {
  title: string;
  placeholder: string;
  start: string;
  tagline: string;
  explore: string;
  about: string;
  exploreLinks: LinkItem[];
  aboutLinks: LinkItem[];
  copyright: string;
};

const copy: Record<Locale, EndCopy> = {
  en: {
    title: "Have an idea for your website?",
    placeholder: "Write your idea here...",
    start: "Start",
    tagline: "We design websites that fit your business.",
    explore: "Explore the site",
    about: "About BlueMind",
    exploreLinks: [{ href: "/services", label: "Services" }, { href: "/templates", label: "Website Templates" }, { href: "/ask-ai", label: "BlueMind AI" }],
    aboutLinks: [{ href: "/about", label: "About Us" }, { href: "/contact", label: "Contact Us" }],
    copyright: "All rights reserved.",
  },
  sv: {
    title: "Har du en idé för din webbplats?",
    placeholder: "Skriv din idé här...",
    start: "Börja",
    tagline: "Vi skapar webbplatser som passar ditt företag.",
    explore: "Utforska webbplatsen",
    about: "Om BlueMind",
    exploreLinks: [{ href: "/services", label: "Tjänster" }, { href: "/templates", label: "Webbplatsmallar" }, { href: "/ask-ai", label: "BlueMind AI" }],
    aboutLinks: [{ href: "/about", label: "Om oss" }, { href: "/contact", label: "Kontakta oss" }],
    copyright: "Alla rättigheter förbehållna.",
  },
  ar: {
    title: "هل لديك فكرة لموقعك؟",
    placeholder: "اكتب فكرتك هنا…",
    start: "ابدأ",
    tagline: "نصمّم مواقع تناسب أعمالك.",
    explore: "استكشف الموقع",
    about: "عن BlueMind",
    exploreLinks: [{ href: "/services", label: "الخدمات" }, { href: "/templates", label: "قوالب المواقع" }, { href: "/ask-ai", label: "BlueMind AI" }],
    aboutLinks: [{ href: "/about", label: "من نحن" }, { href: "/contact", label: "تواصل معنا" }],
    copyright: "جميع الحقوق محفوظة.",
  },
};

const draftKey = "bluemind-ai-draft";

export default function TestHomeEnd() {
  const { locale } = useLocalization();
  const text = copy[locale];
  const router = useRouter();
  const [idea, setIdea] = useState("");

  function startWithIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = idea.trim();
    try {
      if (draft) sessionStorage.setItem(draftKey, draft);
      else sessionStorage.removeItem(draftKey);
    } catch { /* The chat can still open if storage is unavailable. */ }
    router.push("/ask-ai?source=homepage-end");
  }

  return (
    <section className={styles.section} data-test-home-end data-no-translate dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className={styles.inner}>
        <div className={styles.ideaBlock}>
          <h2>{text.title}</h2>
          <form className={styles.ideaForm} onSubmit={startWithIdea}>
            <label className={styles.visuallyHidden} htmlFor="homepage-idea">{text.placeholder}</label>
            <textarea id="homepage-idea" value={idea} onChange={event => setIdea(event.target.value)} placeholder={text.placeholder} rows={1} />
            <button type="submit">{text.start}</button>
          </form>
        </div>

        <div className={styles.linkCard} data-link-card>
          <div className={styles.brandColumn}>
            <Link href="/" aria-label="BlueMind Web Service home"><BrandLockup serviceName="WEB SERVICE" solidLogo /></Link>
            <p>{text.tagline}</p>
          </div>
          <nav className={styles.linkGroup} aria-label={text.explore}>
            <h3>{text.explore}</h3>
            <ul>{text.exploreLinks.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
          </nav>
          <nav className={styles.linkGroup} aria-label={text.about}>
            <h3>{text.about}</h3>
            <ul>{text.aboutLinks.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
          </nav>
          <div className={styles.cardBottom}>
            <span>© {new Date().getFullYear()} BlueMind Web Service</span>
            <span>{text.copyright}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
