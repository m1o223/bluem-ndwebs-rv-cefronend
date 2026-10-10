import SiteFooter from "../site-footer";
import styles from "./home.module.css";

export function AboutSummary() {
  return <section className={`${styles.about} ${styles.container}`} aria-labelledby="about-summary-title">
    <div><p className={styles.eyebrow}>THE WAY WE THINK</p><h2 id="about-summary-title">Built with purpose.</h2></div>
    <div><p className={styles.aboutCopy}>BlueMind Web Service combines thoughtful design and clean development to create modern digital experiences for businesses.</p>
      <div className={styles.strengths}>{["Modern Design", "Clean Development", "Reliable Delivery"].map((strength, index) => <div key={strength}><span>0{index + 1}</span><h3>{strength}</h3></div>)}</div>
    </div>
  </section>;
}

export function Footer() {
  return <SiteFooter />;
}
