import { PlanetWatermark } from "../../components/planet-watermark";
import styles from "./our-work.module.css";

export default function OurWorkPage() {
  return (
    <section className={styles.page}>
      <PlanetWatermark
        className={styles.watermark}
        sizes="(max-width: 620px) 360px, (max-width: 1050px) 560px, 660px"
      />
      <div className={styles.content}>
        <h1>Website Concepts</h1>
      </div>
    </section>
  );
}
