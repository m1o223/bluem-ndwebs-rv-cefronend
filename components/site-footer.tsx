import Image from "next/image";
import Link from "next/link";
import { footerConfig as config } from "./site-footer-config";
import homeStyles from "./home/home.module.css";
import styles from "./site-footer.module.css";
import TextActionLabel from "./text-action-label";

export default function SiteFooter({ textEffects = false }: { textEffects?: boolean }) {
  const activeLegalLinks = config.legalLinks.filter((item) => item.href);

  return <footer className={`${homeStyles.home} ${styles.footer}`} aria-label="BlueMind Web Service footer">
    <div className={homeStyles.container}>
      <div className={styles.columns}>
        <div className={styles.brandSection}>
          <Link href="/" className={styles.brand} aria-label="BlueMind Web Service home"><span>BlueMind Web Service</span></Link>
          <p>{config.brandTagline}</p>
        </div>
        <nav aria-label="Footer explore" className={styles.linkGroup}><h2>Explore</h2><ul>{config.explore.map(([href,label]) => <li key={href}><Link href={href}><TextActionLabel enabled={textEffects}>{label}</TextActionLabel></Link></li>)}</ul></nav>
        <nav aria-label="Footer services" className={styles.linkGroup}><h2>Services</h2><ul>{config.services.map(([href,label]) => <li key={label}><Link href={href}><TextActionLabel enabled={textEffects}>{label}</TextActionLabel></Link></li>)}</ul></nav>
        <section className={styles.contact} aria-labelledby="footer-contact-title"><h2 id="footer-contact-title">Contact</h2>
          <dl><div><dt>Email</dt><dd><a href={`mailto:${config.contact.email}`}><TextActionLabel enabled={textEffects}>{config.contact.email}</TextActionLabel></a></dd></div></dl>
          <Link href="/contact" className={styles.contactLink}><TextActionLabel enabled={textEffects}>Contact Us</TextActionLabel> <span aria-hidden="true">→</span></Link>
        </section>
      </div>
      <div className={styles.middle}>
        <section aria-labelledby="footer-social-title"><h2 id="footer-social-title">Follow BlueMind Web Service</h2><ul className={styles.social}>{config.social.map(item => <li key={item.name}>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${config.brandName} on ${item.name}`}><Image src={item.icon} width={20} height={20} alt="" /><span className={styles.srOnly}>{item.name}</span></a> : <span className={styles.pendingSocial} aria-label={`${config.brandName} on ${item.name}`} aria-disabled="true"><Image src={item.icon} width={20} height={20} alt="" /><span className={styles.srOnly}>{item.name}</span></span>}</li>)}</ul></section>
        <section aria-labelledby="footer-payments-title" className={styles.payments}><h2 id="footer-payments-title">Payment methods</h2><ul>{config.paymentMethods.map(method => <li key={method.name}>{method.asset ? <Image src={method.asset} width={92} height={32} alt={method.name} /> : <span>{method.name}</span>}</li>)}</ul><p className={styles.note}>Available options are confirmed before payment.</p></section>
      </div>
      <div className={styles.bottom}>
        {activeLegalLinks.length > 0 && <nav aria-label="Footer legal"><ul>{activeLegalLinks.map(item => <li key={item.label}><Link href={item.href ?? "#"}><TextActionLabel enabled={textEffects}>{item.label}</TextActionLabel></Link></li>)}</ul></nav>}
        <p className={styles.copyright}>© {new Date().getFullYear()} {config.brandName}. All rights reserved.</p>
      </div>
    </div>
  </footer>;
}

