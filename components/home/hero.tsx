import Link from "next/link";
import HeroImage from "./hero-image";
import styles from "./home.module.css";

export default function Hero() {
  return (
    <section className={`${styles.hero} ${styles.container}`} aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><span className={styles.blueDot} /> BLUEMIND WEB SERVICE</p>
        <h1 id="hero-title">We design digital<br className={styles.desktopBreak} /> experiences that<br className={styles.desktopBreak} /> move businesses<br className={styles.desktopBreak} /> <span>forward.</span></h1>
        <p className={styles.heroDescription}>Modern websites built with thoughtful design,<br className={styles.desktopBreak} /> clean development, and strong performance.</p>
        <div className={styles.actions}><Link href="/quote" className={styles.primaryButton}>Get Started <span aria-hidden="true">↗</span></Link><Link href="/how-we-work" className={styles.textButton}>How We Work <span aria-hidden="true">→</span></Link></div>
      </div>
      <HeroImage />
      <a className={styles.scrollCue} href="#selected-work"><span aria-hidden="true">↓</span> SCROLL TO EXPLORE</a>
    </section>
  );
}
