import PageReveal from "../../components/page-reveal";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import revealStyles from "../../components/page-reveal.module.css";
import { workflowHeadline, workflowPrinciples, workflowSupporting, workSteps } from "../about/about-content";
import styles from "./how-we-work.module.css";

function PointList({ points }: { points: string[] }) {
  return <ul className={styles.pointList}>{points.map(point => <li key={point}>{point}</li>)}</ul>;
}

export default function HowWeWorkPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <PageReveal rootId="how-we-work-reveal-root" />
      <div className={pageStyles.body}>
        <div id="how-we-work-reveal-root" className={`${homeStyles.container} ${pageStyles.content} ${styles.content}`}>
          <header className={styles.intro}>
            <h1 className={revealStyles.item} data-page-reveal-group="how-intro-title">How We Work</h1>
            <div className={`${styles.introCopy} ${revealStyles.item}`} data-page-reveal-group="how-intro-copy">
              <p className={styles.headline}>{workflowHeadline}</p>
              <p className={styles.supporting}>{workflowSupporting}</p>
            </div>
          </header>

          <section className={`${styles.principles} ${revealStyles.item}`} data-page-reveal-group="how-principles" aria-label="How We Work principles">
            <PointList points={workflowPrinciples} />
          </section>

          <ol className={styles.steps} aria-label="Our website project process">
            {workSteps.map((step, index) => (
              <li key={step.title} className={`${styles.step} ${revealStyles.item}`} data-page-reveal-group={`how-step-${index + 1}`}>
                <div className={styles.stepNumber} aria-hidden="true">0{index + 1}</div>
                <div className={styles.stepContent}>
                  <h2>{step.title}</h2>
                  <PointList points={step.points} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
