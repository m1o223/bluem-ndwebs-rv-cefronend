import styles from "./hero.module.css";
import { PlanetWatermark as SharedPlanetWatermark } from "../planet-watermark";

export default function PlanetWatermark() {
  return (
    <SharedPlanetWatermark
      className={styles.planet}
      imageClassName={styles.planetImage}
      sizes="(max-width: 620px) 410px, (max-width: 959px) 600px, 720px"
    />
  );
}
