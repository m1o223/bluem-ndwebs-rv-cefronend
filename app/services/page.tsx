import Link from "next/link";
import { Footer } from "../../components/home/sections";
import homeStyles from "../../components/home/home.module.css";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { PlanetWatermark } from "../../components/planet-watermark";
import styles from "./services.module.css";

const services = [
  { title: "Your Idea, Your Website", text: "Any idea you have, we can turn into a website built around your vision." },
  { title: "No Technical Knowledge Needed", text: "You don’t need to know coding, design, or technical terms. Just tell us what you want." },
  { title: "Can’t Explain Your Idea?", text: "Use ChatGPT to help describe it, send us the result, and we’ll take it from there." },
  { title: "Fast Delivery", text: "Your website can be ready in as little as 5 days, depending on the project." },
  { title: "Everything Ready for You", text: "We handle the design, development, setup, pages, and links so you receive a website ready to use." },
  { title: "No Technical Headaches", text: "No coding. No complicated setup. You give us the direction, and we handle the technical work." },
];

export default function ServicesPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <div className={pageStyles.body}>
        <PlanetWatermark className={styles.watermark} sizes="(max-width: 620px) 400px, (max-width: 1050px) 640px, 800px" />
        <div className={`${homeStyles.container} ${pageStyles.content}`}>
          <div className={`${pageStyles.intro} ${pageStyles.enter} ${styles.intro}`}>
            <h1>Services</h1>
            <p className={styles.headline}>You bring the idea. We handle the rest.</p>
            <p>Tell us what you want, and we’ll turn your idea into a polished, ready-to-use website — without the technical headaches.</p>
          </div>
          <div className={`${styles.sections} ${pageStyles.enter}`}>
            {services.map((service, index) => (
              <section key={service.title} className={styles.section} aria-labelledby={`service-${index + 1}`}>
                <span className={styles.number} aria-hidden="true">0{index + 1}</span>
                <div>
                  <h2 id={`service-${index + 1}`}>{service.title}</h2>
                  <p>{service.text}</p>
                </div>
              </section>
            ))}
          </div>
          <section className={`${styles.cta} ${pageStyles.enter}`} aria-labelledby="services-cta-title">
            <div>
              <h2 id="services-cta-title">Have an idea for your website?</h2>
              <p>Tell us what you have in mind. We’ll help turn it into a real website.</p>
            </div>
            <Link href="/quote" className={`${buttonStyles.ctaButton} ${buttonStyles.primaryCta}`}>Request a Quote</Link>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
