import Image from "next/image";
import Link from "next/link";
import { footerConfig as config } from "./site-footer-config";
import homeStyles from "./home/home.module.css";
import styles from "./site-footer.module.css";

export default function SiteFooter() {
  return <footer className={`${homeStyles.home} ${styles.footer}`} aria-label="BlueMind Web Service footer">
    <div className={homeStyles.container}>
      <div className={styles.columns}>
        <div className={styles.brandSection}>
          <Link href="/" className={styles.brand} aria-label="BlueMind Web Service home"><Image src={config.logo} width={64} height={64} alt="" aria-hidden="true" /><span>BlueMind<span className={styles.brandSub}>Web Service</span></span></Link>
          <p>{config.brandTagline}</p>
        </div>
        <nav aria-label="Footer explore" className={styles.linkGroup}><h2>Explore</h2><ul>{config.explore.map(([href,label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></nav>
        <nav aria-label="Footer services" className={styles.linkGroup}><h2>Services</h2><ul>{config.services.map(([href,label]) => <li key={label}><Link href={href}>{label}</Link></li>)}</ul></nav>
        <section className={styles.contact} aria-labelledby="footer-contact-title"><h2 id="footer-contact-title">Contact</h2>
          {config.contact.approved ? <dl><div><dt>Email</dt><dd><a href={`mailto:${config.contact.email}`}>{config.contact.email}</a></dd></div><div><dt>Phone</dt><dd><a href={`tel:${config.contact.phone.replace(/\s/g, "")}`}>{config.contact.phone}</a></dd></div></dl> : <><dl><div><dt>Email</dt><dd>Details awaiting approval</dd></div><div><dt>Phone</dt><dd>Details awaiting approval</dd></div></dl><p className={styles.note}>Contact details will be added once confirmed.</p></>}
          <Link href="/contact" className={styles.contactLink}>Contact Us <span aria-hidden="true">→</span></Link>
        </section>
      </div>
      <div className={styles.middle}>
        <section aria-labelledby="footer-social-title"><h2 id="footer-social-title">Follow BlueMind</h2><ul className={styles.social}>{config.social.map(item => <li key={item.name}>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`BlueMind on ${item.name}`}><Image src={item.icon} width={18} height={18} alt="" /><span>{item.name}</span></a> : <span className={styles.pendingSocial}><Image src={item.icon} width={18} height={18} alt="" /><span>{item.name}</span></span>}</li>)}</ul><p className={styles.note}>Official account links awaiting confirmation.</p></section>
        <section aria-labelledby="footer-payments-title" className={styles.payments}><h2 id="footer-payments-title">Payment methods we plan to support</h2><ul>{config.paymentMethods.map(method => <li key={method.name}>{method.asset ? <Image src={method.asset} width={92} height={28} alt={method.name} unoptimized /> : method.name}</li>)}</ul><p className={styles.note}>Planned support. Online payments are not enabled yet.</p></section>
      </div>
      <div className={styles.bottom}>
        <div><nav aria-label="Footer legal"><ul>{config.legalLinks.map(item => <li key={item.label}>{item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}</li>)}</ul></nav><p className={styles.note}>Legal policies awaiting review and publication.</p></div>
        <p className={styles.copyright}>© {new Date().getFullYear()} {config.brandName}. All rights reserved.</p>
      </div>
    </div>
  </footer>;
}
