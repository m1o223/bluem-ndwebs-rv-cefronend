import styles from "./planet-watermark.module.css";

export function PlanetWatermark({ className, sizes, imageClassName = "" }: { className: string; sizes: string; imageClassName?: string }) {
  const srcSet = [384, 512, 640, 768, 1024].map(width => `/images/hero/bluemind-hero-${width}.webp ${width}w`).join(", ");
  const imageProps = {
    src: "/images/hero/bluemind-hero-1024.webp",
    srcSet,
    sizes,
    width: 1024,
    height: 768,
    alt: "",
    decoding: "async" as const,
  };

  return (
    <span className={`${className} ${styles.planetSpin}`} aria-hidden="true" data-planet-watermark>
      <img
        {...imageProps}
        loading="eager"
        className={`${styles.planetLight} ${imageClassName}`}
      />
      <span className={styles.surfaceMask}>
        <span className={styles.surfaceTrack}>
          <img {...imageProps} loading="eager" className={styles.surfaceImage} />
          <img {...imageProps} loading="eager" className={styles.surfaceImage} />
        </span>
      </span>
    </span>
  );
}
