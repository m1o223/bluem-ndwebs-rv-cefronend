import Image from "next/image";
import styles from "./blue-mind-planet-logo.module.css";

type BlueMindPlanetLogoProps = {
  className?: string;
  priority?: boolean;
  animated?: boolean;
};

export function BlueMindPlanetLogo({ className = "", priority = false, animated = true }: BlueMindPlanetLogoProps) {
  return (
    <span
      className={`${styles.logo} ${animated ? styles.animated : ""} ${className}`}
      aria-hidden="true"
      data-bluemind-logo
    >
      <span className={styles.tilt}>
        <Image
          src="/images/brand/bluemind-planet-logo.jpg"
          width={512}
          height={512}
          alt=""
          priority={priority}
          sizes="(max-width: 620px) 38px, 64px"
          className={styles.image}
        />
      </span>
    </span>
  );
}
