import styles from "./planet-watermark.module.css";

type PlanetWatermarkProps = {
  className: string;
  sizes?: string;
  imageClassName?: string;
};

export function PlanetWatermark({ className, sizes = "(max-width: 620px) 320px, (max-width: 1050px) 520px, 620px", imageClassName = "" }: PlanetWatermarkProps) {
  return (
    <span className={`${className} ${styles.planetStatic}`} aria-hidden="true" data-planet-watermark>
      <img
        src="/images/brand/bluemind-planet-logo-transparent.png"
        sizes={sizes}
        width={1254}
        height={1254}
        alt=""
        decoding="async"
        loading="eager"
        className={`${styles.planetImage} ${imageClassName}`}
      />
    </span>
  );
}
