import Image from "next/image";
import icons from "../../public/images/about/manifest.json";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { PlanetWatermark } from "../../components/planet-watermark";
import styles from "./about.module.css";

const sections = [
  {
    id: "why-choose-us",
    title: "Why Choose Us",
    icon: icons["quality-check"],
    iconClass: styles.qualityIcon,
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
    icon: icons["distinctive-bulbs"],
    iconClass: styles.bulbsIcon,
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
    icon: icons["idea-to-website"],
    iconClass: styles.workflowIcon,
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
            <div className={`${styles.titleGroup} ${styles.mainTitle}`}>
              <Image
                src={icons["team-orbit"].src}
                width={icons["team-orbit"].width}
                height={icons["team-orbit"].height}
                alt=""
                aria-hidden="true"
                unoptimized
                className={styles.teamIcon}
              />
              <h1>About Us</h1>
            </div>
            <p>Websites built around your ideas, with professional work, clear communication, and fair pricing.</p>
          </div>
          <div className={`${styles.sections} ${pageStyles.enter}`}>
            {sections.map(section => (
              <section key={section.id} className={styles.section} aria-labelledby={section.id}>
                <div className={`${styles.titleGroup} ${styles.sectionTitle}`}>
                  <Image
                    src={section.icon.src}
                    width={section.icon.width}
                    height={section.icon.height}
                    alt=""
                    aria-hidden="true"
                    unoptimized
                    className={section.iconClass}
                  />
                  <h2 id={section.id}>{section.title}</h2>
                </div>
                <ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
