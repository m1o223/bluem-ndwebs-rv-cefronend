import homeStyles from "../../components/home/home.module.css";
import { Mail } from "lucide-react";
import { contactConfig } from "./contact-config";
import styles from "./contact.module.css";
import ContactForm from "./contact-form";
import ContactReveal from "./contact-reveal";

export default function ContactPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${styles.page}`}>
      <section className={styles.contact} data-reveal-exclude aria-labelledby="contact-title">
        <div id="contact-reveal-root" className={`${homeStyles.container} ${styles.content}`}>
          <ContactReveal />
          <div className={styles.intro}>
            <h1 id="contact-title" className={styles.revealItem} data-contact-reveal-group="intro-title">Contact Us</h1>
            <p className={styles.revealItem} data-contact-reveal-group="intro-copy">Have a question or need help? Get in touch with our team.</p>
          </div>
          <a className={`${styles.emailCard} ${styles.revealItem}`} data-contact-reveal-group="email" href={`mailto:${contactConfig.email}`}>
            <span className={styles.emailIcon} aria-hidden="true"><Mail size={22} strokeWidth={1.8} /></span>
            <span className={styles.emailCopy}>
              <span className={styles.emailLabel}>Email us</span>
              <span className={styles.emailAddress} dir="ltr">{contactConfig.email}</span>
            </span>
          </a>
          <section className={`${styles.formSpace} ${styles.revealItem}`} data-contact-reveal-group="form-card" aria-labelledby="form-preview-title">
            <h2 id="form-preview-title">Send a message</h2>
            <ContactForm />
          </section>
        </div>
      </section>
    </div>
  );
}
