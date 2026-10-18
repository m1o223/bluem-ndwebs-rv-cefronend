import AboutStructure from "./about-structure";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <div id="top" className={styles.page}>
      <header className={styles.intro}>
        <h1>About Us</h1>
        <p>Websites built around your ideas, with professional work, clear communication, and fair pricing.</p>
      </header>
      <AboutStructure />
    </div>
  );
}
