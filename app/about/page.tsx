import CircularCarousel from "../../components/circular-carousel/circular-carousel";
import { sections } from "./sections";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <div id="top" className={styles.page}>
      <header className={styles.intro}>
        <h1>About Us</h1>
        <p>Websites built around your ideas, with professional work, clear communication, and fair pricing.</p>
      </header>
      <CircularCarousel
        items={sections.map(section => ({ title: section.title, titleSuffix: section.question ? "?" : "", text: section.points, image: section.icon }))}
        label="About BlueMind"
        navigationLabel="About navigation"
        stageTestId="about-stage"
        contentSized
      />
    </div>
  );
}
