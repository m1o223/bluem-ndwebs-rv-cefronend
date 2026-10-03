import styles from "./planet-watermark.module.css";

export function PlanetWatermark({ className, sizes, imageClassName = "" }: { className: string; sizes: string; imageClassName?: string }) {
  return (
    <picture className={className} aria-hidden="true" data-planet-watermark>
      <img
        src="/images/hero/bluemind-hero-1024.webp"
        srcSet={[384, 512, 640, 768, 1024].map(width => `/images/hero/bluemind-hero-${width}.webp ${width}w`).join(", ")}
        sizes={sizes}
        width={1024}
        height={768}
        alt=""
        loading="eager"
        decoding="async"
        className={`${styles.rotating} ${imageClassName}`}
      />
    </picture>
  );
}
