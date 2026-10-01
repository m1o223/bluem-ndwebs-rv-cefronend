import Link from "next/link";
import styles from "./home.module.css";

export function AboutSummary() {
  return <section className={`${styles.about} ${styles.container}`} aria-labelledby="about-summary-title">
    <div><p className={styles.eyebrow}>THE WAY WE THINK</p><h2 id="about-summary-title">Built with purpose.</h2></div>
    <div><p className={styles.aboutCopy}>BlueMind Web Service combines thoughtful design and clean development to create modern digital experiences for businesses.</p>
      <div className={styles.strengths}>{["Modern Design", "Clean Development", "Reliable Delivery"].map((strength, index) => <div key={strength}><span>0{index + 1}</span><h3>{strength}</h3></div>)}</div>
    </div>
  </section>;
}

export function FinalCTA() {
  return <section className={`${styles.cta} ${styles.container}`} aria-labelledby="cta-title"><div><p className={styles.eyebrow}>YOUR NEXT CHAPTER</p><h2 id="cta-title">Have an idea?<br /><span>Let’s build it.</span></h2></div><div className={styles.actions}><Link className={styles.primaryButton} href="/quote">Start a Project <span aria-hidden="true">↗</span></Link><Link className={styles.textButton} href="/contact">Contact Us <span aria-hidden="true">→</span></Link></div></section>;
}

export function Footer() {
  return <footer className={`${styles.footer} ${styles.container}`}><span>© {new Date().getFullYear()} BlueMind Web Service</span><span>Thoughtfully designed. Built to perform.</span><a href="#top">Back to top <span aria-hidden="true">↑</span></a></footer>;
}
