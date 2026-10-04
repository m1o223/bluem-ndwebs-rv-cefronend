import homeStyles from "../../components/home/home.module.css";
import { PlanetWatermark } from "../../components/planet-watermark";
import { contactConfig } from "./contact-config";
import styles from "./contact.module.css";
import ContactForm from "./contact-form";

export default function ContactPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${styles.page}`}>
      <section className={styles.contact} aria-labelledby="contact-title">
        <PlanetWatermark className={styles.watermark} sizes="(max-width: 620px) 410px, (max-width: 959px) 600px, 720px" />
        <div className={`${homeStyles.container} ${styles.content}`}>
          <div className={styles.intro}>
            <h1 id="contact-title">Contact Us</h1>
            <p>Tell us about your idea, your question, or your existing order.</p>
          </div>
          <div className={styles.columns}>
            <aside className={styles.details} aria-label="Contact information">
              <dl>
                <div><dt>Email</dt><dd>{contactConfig.email}</dd></div>
                <div><dt>Phone</dt><dd>{contactConfig.phone}</dd></div>
              </dl>
              <p className={styles.previewNotice}>{contactConfig.previewNotice}</p>
            </aside>
            <section className={styles.formSpace} aria-labelledby="form-preview-title">
              <h2 id="form-preview-title">Message form</h2>
              <ContactForm />
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
