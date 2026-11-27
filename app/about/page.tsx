import PageReveal from "../../components/page-reveal";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import revealStyles from "../../components/page-reveal.module.css";
import { aboutIntro, aboutSections } from "./about-content";
import styles from "./about.module.css";

function PointList({ points }: { points: string[] }) {
  return <ul className={styles.pointList}>{points.map(point => <li key={point}>{point}</li>)}</ul>;
}

export default function AboutPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <PageReveal rootId="about-reveal-root" />
      <div className={pageStyles.body}>
        <div id="about-reveal-root" className={`${homeStyles.container} ${pageStyles.content} ${styles.content}`}>
          <header className={styles.intro}>
            <h1 className={revealStyles.item} data-page-reveal-group="about-intro-title">About Us</h1>
            <p className={revealStyles.item} data-page-reveal-group="about-intro-copy">{aboutIntro}</p>
          </header>

          <div className={styles.textSections}>
            {aboutSections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className={`${styles.section} ${revealStyles.item}`}
                data-page-reveal-group={`about-section-${index + 1}`}
                aria-labelledby={`${section.id}-title`}
              >
                <div className={styles.sectionCopy}>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  <PointList points={section.points} />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
