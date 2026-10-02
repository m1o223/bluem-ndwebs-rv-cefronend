import styles from "./hero.module.css";

export default function PlanetWatermark() {
  return (
    <picture className={styles.planet} aria-hidden="true" data-planet-watermark>
      <img
        src="/images/hero/bluemind-hero-1024.webp"
        srcSet={[384, 512, 640, 768, 1024].map(width => `/images/hero/bluemind-hero-${width}.webp ${width}w`).join(", ")}
        sizes="(max-width: 620px) 410px, (max-width: 959px) 600px, 720px"
        width={1024}
        height={768}
        alt=""
        loading="eager"
        decoding="async"
        className={styles.planetImage}
      />
    </picture>
  );
}
