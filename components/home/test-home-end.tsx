"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocalization, type Locale } from "../localization-provider";
import { BrandLockup } from "../brand-lockup";
import { footerConfig as config } from "../site-footer-config";
import TextActionLabel from "../text-action-label";
import homeStyles from "../home/home.module.css";
import footerStyles from "../site-footer.module.css";
import styles from "./test-home-end.module.css";

type LinkItem = { href: string; label: string };
type FooterCopy = {
  ariaLabel: string;
  tagline: string;
  explore: string;
  services: string;
  contact: string;
  email: string;
  contactUs: string;
  follow: string;
  payments: string;
  paymentNote: string;
  copyright: string;
  exploreLinks: LinkItem[];
  serviceLinks: LinkItem[];
};

const copy: Record<Locale, FooterCopy> = {
  en: {
    ariaLabel: "BlueMind Web Service footer",
    tagline: "Your idea. Our expertise. Built for the web.",
    explore: "Explore",
    services: "Services",
    contact: "Contact",
    email: "Email",
    contactUs: "Contact Us",
    follow: "Follow BlueMind Web Service",
    payments: "Payment methods",
    paymentNote: "Available options are confirmed before payment.",
    copyright: "All rights reserved.",
    exploreLinks: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About Us" },
      { href: "/services", label: "Services" },
      { href: "/how-we-work", label: "How We Work" },
      { href: "/#selected-work", label: "Website Concepts" },
      { href: "/faq", label: "FAQ" },
      { href: "/quote", label: "Request a Quote" },
      { href: "/contact", label: "Contact" },
      { href: "/care", label: "Website Care" },
      { href: "/security", label: "Security" },
    ],
    serviceLinks: [
      { href: "/services", label: "Website Design" },
      { href: "/quote", label: "Business Websites" },
      { href: "/quote", label: "Online Stores" },
      { href: "/quote", label: "Custom Websites" },
      { href: "/care", label: "BlueMind Care" },
    ],
  },
  sv: {
    ariaLabel: "Sidfot för BlueMind Web Service",
    tagline: "Din idé. Vår expertis. Byggd för webben.",
    explore: "Utforska",
    services: "Tjänster",
    contact: "Kontakt",
    email: "E-post",
    contactUs: "Kontakta oss",
    follow: "Följ BlueMind Web Service",
    payments: "Betalningsmetoder",
    paymentNote: "Tillgängliga alternativ bekräftas före betalning.",
    copyright: "Alla rättigheter förbehållna.",
    exploreLinks: [
      { href: "/", label: "Hem" },
      { href: "/about", label: "Om oss" },
      { href: "/services", label: "Tjänster" },
      { href: "/how-we-work", label: "Så arbetar vi" },
      { href: "/#selected-work", label: "Webbplatskoncept" },
      { href: "/faq", label: "Vanliga frågor" },
      { href: "/quote", label: "Begär en offert" },
      { href: "/contact", label: "Kontakt" },
      { href: "/care", label: "Webbplatsvård" },
      { href: "/security", label: "Säkerhet" },
    ],
    serviceLinks: [
      { href: "/services", label: "Webbdesign" },
      { href: "/quote", label: "Företagswebbplatser" },
      { href: "/quote", label: "Webbbutiker" },
      { href: "/quote", label: "Anpassade webbplatser" },
      { href: "/care", label: "BlueMind Care" },
    ],
  },
  ar: {
    ariaLabel: "تذييل BlueMind Web Service",
    tagline: "فكرتك. خبرتنا. موقع جاهز للويب.",
    explore: "استكشف",
    services: "الخدمات",
    contact: "التواصل",
    email: "البريد الإلكتروني",
    contactUs: "تواصل معنا",
    follow: "تابع BlueMind Web Service",
    payments: "طرق الدفع",
    paymentNote: "يتم تأكيد الخيارات المتاحة قبل الدفع.",
    copyright: "جميع الحقوق محفوظة.",
    exploreLinks: [
      { href: "/", label: "الرئيسية" },
      { href: "/about", label: "من نحن" },
      { href: "/services", label: "الخدمات" },
      { href: "/how-we-work", label: "كيف نعمل" },
      { href: "/#selected-work", label: "مفاهيم المواقع" },
      { href: "/faq", label: "الأسئلة الشائعة" },
      { href: "/quote", label: "طلب عرض سعر" },
      { href: "/contact", label: "التواصل" },
      { href: "/care", label: "رعاية المواقع" },
      { href: "/security", label: "الأمان" },
    ],
    serviceLinks: [
      { href: "/services", label: "تصميم المواقع" },
      { href: "/quote", label: "مواقع الأعمال" },
      { href: "/quote", label: "المتاجر الإلكترونية" },
      { href: "/quote", label: "مواقع مخصصة" },
      { href: "/care", label: "BlueMind Care" },
    ],
  },
};

function FooterLink({ item }: { item: LinkItem }) {
  return <Link href={item.href}><span className={footerStyles.linkText}><TextActionLabel>{item.label}</TextActionLabel></span></Link>;
}

export default function TestHomeEnd() {
  const { locale } = useLocalization();
  const text = copy[locale];
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <section className={styles.section} data-test-home-end data-no-translate dir={direction}>
      <footer className={`${homeStyles.home} ${footerStyles.footer} ${styles.footerCard}`} aria-label={text.ariaLabel}>
        <div className={styles.footerInner}>
          <div className={footerStyles.columns}>
            <div className={footerStyles.brandSection}>
              <Link href="/" className={styles.brandLink} aria-label="BlueMind Web Service home"><BrandLockup serviceName="WEB SERVICE" solidLogo /></Link>
              <p>{text.tagline}</p>
            </div>
            <nav aria-label={text.explore} className={`${footerStyles.linkGroup} ${footerStyles.exploreGroup}`}>
              <h2>{text.explore}</h2>
              <ul>{text.exploreLinks.map(item => <li key={`${item.href}-${item.label}`}><FooterLink item={item} /></li>)}</ul>
            </nav>
            <nav aria-label={text.services} className={`${footerStyles.linkGroup} ${footerStyles.servicesGroup}`}>
              <h2>{text.services}</h2>
              <ul>{text.serviceLinks.map(item => <li key={item.label}><FooterLink item={item} /></li>)}</ul>
            </nav>
            <section className={footerStyles.contact} aria-labelledby="test-footer-contact-title">
              <h2 id="test-footer-contact-title">{text.contact}</h2>
              <dl><div><dt>{text.email}</dt><dd><a href={`mailto:${config.contact.email}`}><span className={footerStyles.linkText}><TextActionLabel>{config.contact.email}</TextActionLabel></span></a></dd></div></dl>
              <Link href="/contact" className={footerStyles.contactLink}><span className={footerStyles.linkText}><TextActionLabel>{text.contactUs}</TextActionLabel></span><span aria-hidden="true">→</span></Link>
            </section>
          </div>

          <div className={footerStyles.middle}>
            <section aria-labelledby="test-footer-social-title">
              <h2 id="test-footer-social-title">{text.follow}</h2>
              <ul className={footerStyles.social}>{config.social.map(item => <li key={item.name}><a href={item.url || "#"} target="_blank" rel="noopener noreferrer" aria-label={`${config.brandName} on ${item.name}`}><Image src={item.icon} width={20} height={20} alt="" /><span className={footerStyles.srOnly}>{item.name}</span></a></li>)}</ul>
            </section>
            <section aria-labelledby="test-footer-payments-title" className={footerStyles.payments}>
              <h2 id="test-footer-payments-title">{text.payments}</h2>
              <ul>{config.paymentMethods.map(method => <li key={method.name}>{method.asset ? <Image src={method.asset} width={92} height={32} alt={method.name} /> : <span>{method.name}</span>}</li>)}</ul>
              <p className={footerStyles.note}>{text.paymentNote}</p>
            </section>
          </div>

          <div className={footerStyles.bottom}>
            <p className={footerStyles.copyright}>© {new Date().getFullYear()} {config.brandName}. {text.copyright}</p>
          </div>
        </div>
      </footer>
    </section>
  );
}
