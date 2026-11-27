import homeStyles from "../../components/home/home.module.css";
import { Mail } from "lucide-react";
import Image from "next/image";
import { contactConfig } from "./contact-config";
import { footerConfig } from "../../components/site-footer-config";
import styles from "./contact.module.css";
import ContactForm from "./contact-form";
import ContactReveal from "./contact-reveal";
import revealStyles from "../../components/page-reveal.module.css";

export default function ContactPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${styles.page}`}>
      <section className={styles.contact} data-reveal-exclude aria-labelledby="contact-title">
        <div id="contact-reveal-root" className={`${homeStyles.container} ${styles.content}`}>
          <ContactReveal />
          <div className={styles.intro}>
            <h1 id="contact-title" className={revealStyles.item} data-page-reveal-group="intro-title">Contact Us</h1>
            <p className={revealStyles.item} data-page-reveal-group="intro-copy">Have a question or need help? Get in touch with our team.</p>
          </div>
          <div className={`${styles.emailCluster} ${revealStyles.item}`} data-page-reveal-group="email">
            <a className={styles.emailCard} href={`mailto:${contactConfig.email}`}>
              <span className={styles.emailIcon} aria-hidden="true"><Mail size={22} strokeWidth={1.8} /></span>
              <span className={styles.emailCopy}>
                <span className={styles.emailLabel}>Email us</span>
                <span className={styles.emailAddress} dir="ltr">{contactConfig.email}</span>
              </span>
            </a>
            <p className={styles.responseTime}>We usually reply within 24 hours.</p>
            <ul className={styles.contactSocials} aria-label="Social media links">
              {footerConfig.social.map(item => item.url ? (
                <li key={item.name}>
                  <a className={styles.contactSocialLink} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${footerConfig.brandName} on ${item.name}`}>
                    <Image src={item.icon} width={18} height={18} alt="" />
                    <span className={styles.srOnly}>{item.name}</span>
                  </a>
                </li>
              ) : null)}
            </ul>
          </div>
          <section className={`${styles.formSpace} ${revealStyles.item}`} data-page-reveal-group="form-card" aria-labelledby="form-preview-title">
            <h2 id="form-preview-title">Send a message</h2>
            <ContactForm />
          </section>
        </div>
      </section>
    </div>
  );
}
