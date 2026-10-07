import Image from "next/image";
import styles from "./blue-mind-planet-logo.module.css";

type BlueMindPlanetLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BlueMindPlanetLogo({ className = "", priority = false }: BlueMindPlanetLogoProps) {
  return (
    <span
      className={`${styles.logo} ${className}`}
      aria-hidden="true"
      data-bluemind-logo
    >
      <span className={styles.tilt}>
        <Image
          src="/images/brand/bluemind-planet-logo-transparent.png"
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
