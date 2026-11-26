import PageReveal from "../../components/page-reveal";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import revealStyles from "../../components/page-reveal.module.css";
import { AiComingSoonLink } from "../../components/ai-coming-soon";
import styles from "./services.module.css";

const services = [
  { title: "Your Idea, Your Website", text: "Any idea you have, we can turn it into a website built around your vision." },
  { title: "No Technical Knowledge Needed", text: "You don’t need to know coding, design, or technical terms. Just tell us what you want." },
  { title: "Can’t Explain Your Idea?", text: "Use ChatGPT to help describe it, send us the result, and we’ll take it from there." },
  { title: "Fast Delivery", text: "Your website can be ready in as little as 5 days, depending on the project." },
  { title: "Everything Ready for You", text: "We handle the design, development, setup, pages, and links so you receive a website ready to use." },
  { title: "No Technical Headaches", text: "No coding. No complicated setup. You give us the direction, and we handle the technical work." },
] as const;

function PointList({ points }: { points: string[] }) {
  return <ul className={styles.pointList}>{points.map(point => <li key={point}>{point}</li>)}</ul>;
}

export default function ServicesPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <PageReveal rootId="services-reveal-root" />
      <div className={pageStyles.body}>
        <div id="services-reveal-root" className={`${homeStyles.container} ${pageStyles.content} ${styles.content}`}>
          <header className={styles.intro}>
            <h1 className={revealStyles.item} data-page-reveal-group="services-intro-title">Services</h1>
            <div className={`${styles.introCopy} ${revealStyles.item}`} data-page-reveal-group="services-intro-copy">
              <p className={styles.headline}>You bring the idea. We handle the rest.</p>
              <p>Tell us what you want, and we’ll turn your idea into a polished, ready-to-use website — without the technical headaches.</p>
            </div>
            <div className={`${styles.introActions} ${revealStyles.item}`} data-page-reveal-group="services-intro-action">
              <AiComingSoonLink href="/ask-ai" className={styles.aiButton}>Get Started with BlueMind AI</AiComingSoonLink>
            </div>
          </header>

          <div className={styles.sections}>
            {services.map((service, index) => (
              <section
                key={service.title}
                className={`${styles.section} ${revealStyles.item}`}
                data-page-reveal-group={`services-section-${index + 1}`}
                aria-labelledby={`service-${index + 1}`}
              >
                <div className={styles.number} aria-hidden="true">0{index + 1}</div>
                <div className={styles.sectionCopy}>
                  <h2 id={`service-${index + 1}`}>{service.title}</h2>
                  <PointList points={[service.text]} />
                </div>
              </section>
            ))}
          </div>

          <section className={`${styles.cta} ${revealStyles.item}`} data-page-reveal-group="services-cta" aria-labelledby="services-cta-title">
            <h2 id="services-cta-title">Have an idea for your website?</h2>
            <PointList points={["Tell us what you have in mind. We’ll help turn it into a real website."]} />
          </section>
        </div>
      </div>
    </div>
  );
}
