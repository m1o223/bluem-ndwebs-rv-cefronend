import Link from "next/link";
import HeroVisual from "./hero-visual";
import shared from "./home.module.css";
import styles from "./hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title" data-hero>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`${shared.eyebrow} ${styles.eyebrow}`}><span className={shared.blueDot} /> BLUEMIND WEB SERVICE</p>
          <h1 id="hero-title" className={styles.headline}>
            <span>We design.</span>
            <span>We develop.</span>
            <span className={styles.accent}>You move forward.</span>
          </h1>
          <p className={styles.description}>Thoughtfully designed. Expertly developed.<br />Websites that move your business forward.</p>
          <div className={`${shared.actions} ${styles.actions}`}>
            <Link href="/quote" className={`${styles.ctaButton} ${styles.primaryCta}`}>Get Started</Link>
            <Link href="#selected-work" className={styles.ctaButton}>Explore Concepts</Link>
          </div>
        </div>
        <HeroVisual />
        <a className={styles.scrollCue} href="#selected-work"><span aria-hidden="true">↓</span> SCROLL TO EXPLORE</a>
      </div>
    </section>
  );
}
