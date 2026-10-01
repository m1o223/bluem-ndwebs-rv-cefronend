import styles from "./home.module.css";

const imagePath = (width: number) => `/images/hero/bluemind-hero-${width}.webp`;
const sources = (widths: number[]) => widths.map(width => `${imagePath(width)} ${width}w`).join(", ");

export default function HeroImage() {
  // Pre-sized lossless assets prevent another lossy encoding or accidental
  // enlargement by an optimizer. The browser chooses the actual Retina size.
  return (
    <picture className={styles.heroArtwork} aria-hidden="true">
      <source media="(max-width: 620px)" srcSet={sources([256, 384, 512, 768, 1024])} sizes="245px" />
      <source media="(max-width: 1120px)" srcSet={sources([384, 640, 768, 1024])} sizes="calc((100vw - 86px) / 2.2)" />
      <img
        src={imagePath(1024)}
        srcSet={sources([384, 512, 640, 768, 1024])}
        sizes="(min-width: 1236px) 505px, calc((100vw - 106px) / 2.24)"
        width={1024}
        height={768}
        alt=""
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={styles.heroImage}
      />
    </picture>
  );
}
