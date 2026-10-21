import Link from "next/link";
import AiPageLink from "./ai-page-link";
import HeroVisual from "./hero-visual";
import shared from "./home.module.css";
import styles from "./hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title" data-hero>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.headline}>
            <span>We design &amp; develop</span>{" "}
            <span>You move forward</span>
          </h1>
          <p className={styles.description}>Websites built around your ideas, designed to move your business forward.</p>
          <div className={`${shared.actions} ${styles.actions}`}>
            <Link href="/quote" className={`${styles.ctaButton} ${styles.primaryCta}`}>Get Started</Link>
            <AiPageLink triggerClassName={styles.ctaButton} />
          </div>
        </div>
        <HeroVisual />
        <a className={styles.scrollCue} href="#selected-work"><span aria-hidden="true">↓</span> SCROLL TO EXPLORE</a>
      </div>
    </section>
  );
}
