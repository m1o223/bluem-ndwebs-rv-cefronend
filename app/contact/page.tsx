import homeStyles from "../../components/home/home.module.css";
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
          <div className={styles.columns}>
            <aside className={`${styles.details} ${styles.revealItem}`} data-contact-reveal-group="contact-summary" aria-label="Contact information">
              <dl>
                <div><dt>Email</dt><dd><a href={`mailto:${contactConfig.email}`}>{contactConfig.email}</a></dd></div>
              </dl>
            </aside>
            <section className={styles.formSpace} aria-labelledby="form-preview-title">
              <h2 id="form-preview-title" className={styles.revealItem} data-contact-reveal-group="contact-summary">Send a message</h2>
              <ContactForm />
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
