import { Footer } from "../../components/home/sections";
import homeStyles from "../../components/home/home.module.css";
import { contactConfig } from "./contact-config";
import styles from "./contact.module.css";

export default function ContactPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${styles.page}`}>
      <section className={styles.contact} aria-labelledby="contact-title">
        <picture className={styles.watermark} aria-hidden="true">
          <img
            src="/images/hero/bluemind-hero-1024.webp"
            srcSet={[384, 512, 640, 768, 1024].map(width => `/images/hero/bluemind-hero-${width}.webp ${width}w`).join(", ")}
            sizes="(max-width: 620px) 410px, (max-width: 959px) 600px, 720px"
            width={1024}
            height={768}
            alt=""
            loading="eager"
            decoding="async"
          />
        </picture>
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
              <p>The contact form will be added in the next stage.<br />Sending is not enabled in this preview.</p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
