import { Footer } from "../../components/home/sections";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { PlanetWatermark } from "../../components/planet-watermark";
import styles from "./about.module.css";

const sections = [
  {
    id: "why-choose-us",
    title: "Why Choose Us",
    points: [
      "We work fast without compromising on quality.",
      "We keep you involved throughout the entire project.",
      "Want something changed? Just tell us, and we’ll work with you to adjust it.",
      "Your feedback matters at every step.",
    ],
  },
  {
    id: "what-makes-us-different",
    title: "What Makes Us Different",
    points: [
      "We have deep knowledge of web design and development.",
      "We pay attention to every detail.",
      "We make working with us simple and flexible.",
      "High-quality websites without the high price.",
    ],
  },
  {
    id: "how-we-work",
    title: "How We Work",
    points: [
      "You tell us your idea, and we turn it into a real website.",
      "We communicate with you throughout the process.",
      "We listen to your feedback and make the changes you need.",
      "Our goal is to build a website that truly fits you and your business.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <div className={pageStyles.body}>
        <PlanetWatermark className={styles.watermark} sizes="(max-width: 620px) 360px, (max-width: 1050px) 600px, 720px" />
        <div className={`${homeStyles.container} ${pageStyles.content}`}>
          <div className={`${pageStyles.intro} ${pageStyles.enter}`}>
            <h1>About Us</h1>
            <p>Websites built around your ideas, with professional work, clear communication, and fair pricing.</p>
          </div>
          <div className={`${styles.sections} ${pageStyles.enter}`}>
            {sections.map(section => (
              <section key={section.id} className={styles.section} aria-labelledby={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                <ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul>
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
