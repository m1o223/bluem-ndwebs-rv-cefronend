import Image from "next/image";
import { BrandLockup } from "./brand-lockup";
import Link from "next/link";
import { footerConfig as config } from "./site-footer-config";
import homeStyles from "./home/home.module.css";
import styles from "./site-footer.module.css";

export default function SiteFooter() {
  const activeSocialLinks = config.social.filter((item) => item.url);
  const activeLegalLinks = config.legalLinks.filter((item) => item.href);

  return <footer className={`${homeStyles.home} ${styles.footer}`} aria-label="BlueMind Web Service footer">
    <div className={homeStyles.container}>
      <div className={styles.columns}>
        <div className={styles.brandSection}>
          <Link href="/" className={styles.brand} aria-label="BlueMind Web Service home"><BrandLockup logoClassName={styles.brandLogo} /></Link>
          <p>{config.brandTagline}</p>
        </div>
        <nav aria-label="Footer explore" className={styles.linkGroup}><h2>Explore</h2><ul>{config.explore.map(([href,label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></nav>
        <nav aria-label="Footer services" className={styles.linkGroup}><h2>Services</h2><ul>{config.services.map(([href,label]) => <li key={label}><Link href={href}>{label}</Link></li>)}</ul></nav>
        <section className={styles.contact} aria-labelledby="footer-contact-title"><h2 id="footer-contact-title">Contact</h2>
          <dl><div><dt>Email</dt><dd><a href={`mailto:${config.contact.email}`}>{config.contact.email}</a></dd></div></dl>
          <Link href="/contact" className={styles.contactLink}>Contact Us <span aria-hidden="true">→</span></Link>
        </section>
      </div>
      <div className={styles.middle}>
        {activeSocialLinks.length > 0 && <section aria-labelledby="footer-social-title"><h2 id="footer-social-title">Follow BlueMind Web Service</h2><ul className={styles.social}>{activeSocialLinks.map(item => <li key={item.name}><a href={item.url ?? "#"} target="_blank" rel="noopener noreferrer" aria-label={`${config.brandName} on ${item.name}`}><Image src={item.icon} width={18} height={18} alt="" /><span>{item.name}</span></a></li>)}</ul></section>}
        <section aria-labelledby="footer-payments-title" className={styles.payments}><h2 id="footer-payments-title">Payment methods we plan to support</h2><ul>{config.paymentMethods.map(method => <li key={method.name}>{method.asset ? <Image src={method.asset} width={92} height={32} alt={method.name} /> : <span>{method.name}</span>}{method.note ? <small>{method.note}</small> : null}</li>)}</ul><p className={styles.note}>Planned support. Online payments are not enabled yet.</p></section>
      </div>
      <div className={styles.bottom}>
        {activeLegalLinks.length > 0 && <nav aria-label="Footer legal"><ul>{activeLegalLinks.map(item => <li key={item.label}><Link href={item.href ?? "#"}>{item.label}</Link></li>)}</ul></nav>}
        <p className={styles.copyright}>© {new Date().getFullYear()} {config.brandName}. All rights reserved.</p>
      </div>
    </div>
  </footer>;
}
