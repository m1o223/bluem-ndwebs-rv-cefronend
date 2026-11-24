"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "./brand-lockup";
import { useLocalization } from "./localization-provider";
import { footerCopy, type FooterLinkItem } from "./site-footer-copy";
import { footerConfig as config } from "./site-footer-config";
import TextActionLabel from "./text-action-label";
import { ComingSoonLink } from "./ai-coming-soon";
import { CookieSettingsButton } from "./cookie-consent";
import styles from "./site-footer.module.css";

function FooterLink({ item, textEffects }: { item: FooterLinkItem; textEffects: boolean }) {
  const kind = item.href === "/quote" ? "pricing" : item.href === "/care" ? "subscriptions" : null;
  const content = <span className={styles.linkText}><TextActionLabel enabled={textEffects}>{item.label}</TextActionLabel></span>;
  return kind ? <ComingSoonLink href={item.href} kind={kind}>{content}</ComingSoonLink> : <Link href={item.href}>{content}</Link>;
}

export default function SiteFooter({ textEffects = false }: { textEffects?: boolean }) {
  const { locale } = useLocalization();
  const text = footerCopy[locale];
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <section className={styles.section} data-site-footer data-no-translate dir={direction}>
      <footer className={styles.footer} aria-label={text.ariaLabel}>
        <div className={styles.footerInner}>
          <div className={styles.columns}>
            <div className={styles.brandSection}>
              <Link href="/" className={styles.brand} aria-label="BlueMind Web Service home"><BrandLockup serviceName="WEB SERVICE" solidLogo /></Link>
              <p>{text.tagline}</p>
            </div>
            <nav aria-label={text.explore} className={`${styles.linkGroup} ${styles.exploreGroup}`}>
              <h2>{text.explore}</h2>
              <ul>{text.exploreLinks.map(item => <li key={`${item.href}-${item.label}`}><FooterLink item={item} textEffects={textEffects} /></li>)}</ul>
            </nav>
            <nav aria-label={text.services} className={`${styles.linkGroup} ${styles.servicesGroup}`}>
              <h2>{text.services}</h2>
              <ul>{text.serviceLinks.map(item => <li key={item.label}><FooterLink item={item} textEffects={textEffects} /></li>)}</ul>
            </nav>
            <section className={styles.contact} aria-labelledby="footer-contact-title">
              <h2 id="footer-contact-title">{text.contact}</h2>
              <dl><div><dt>{text.email}</dt><dd><a href={`mailto:${config.contact.email}`}><span className={styles.linkText}><TextActionLabel enabled={textEffects}>{config.contact.email}</TextActionLabel></span></a></dd></div></dl>
              <Link href="/contact" className={styles.contactLink}><span className={styles.linkText}><TextActionLabel enabled={textEffects}>{text.contactUs}</TextActionLabel></span><span aria-hidden="true">→</span></Link>
            </section>
          </div>

          <div className={styles.middle}>
            <section aria-labelledby="footer-social-title">
              <h2 id="footer-social-title">{text.follow}</h2>
              <ul className={styles.social}>{config.social.map(item => <li key={item.name}>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${config.brandName} on ${item.name}`}><Image src={item.icon} width={20} height={20} alt="" /><span className={styles.srOnly}>{item.name}</span></a> : <span className={styles.pendingSocial} aria-label={`${config.brandName} on ${item.name}`} aria-disabled="true"><Image src={item.icon} width={20} height={20} alt="" /><span className={styles.srOnly}>{item.name}</span></span>}</li>)}</ul>
            </section>
            <section aria-labelledby="footer-payments-title" className={styles.payments}>
              <h2 id="footer-payments-title">{text.payments}</h2>
              <ul>{config.paymentMethods.map(method => <li key={method.name}>{method.asset ? <Image src={method.asset} width={92} height={32} alt={method.name} /> : <span>{method.name === "Faktura" ? (locale === "ar" ? "فاتورة" : locale === "sv" ? "Faktura" : "Invoice") : method.name}</span>}</li>)}</ul>
              <p className={styles.note}>{text.paymentNote}</p>
            </section>
          </div>

          <div className={styles.bottom}>
            <nav aria-label="Footer legal"><ul>{text.legalLinks.map(item => <li key={item.href}><Link href={item.href}><span className={styles.linkText}><TextActionLabel enabled={textEffects}>{item.label}</TextActionLabel></span></Link></li>)}<li><CookieSettingsButton label={text.cookieSettings} /></li></ul></nav>
            <p className={styles.copyright}>© {new Date().getFullYear()} {config.brandName}. {text.copyright}</p>
          </div>
        </div>
      </footer>
    </section>
  );
}
