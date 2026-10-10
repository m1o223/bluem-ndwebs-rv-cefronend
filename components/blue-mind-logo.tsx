import Image from "next/image";
import styles from "./blue-mind-logo.module.css";

type BlueMindLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BlueMindLogo({ className = "", priority = false }: BlueMindLogoProps) {
  return (
    <span className={`${styles.logo} ${className}`} aria-hidden="true" data-bluemind-logo>
      <Image
        src="/images/brand/bluemind-original-logo-transparent.png"
        width={1065}
        height={1212}
        alt=""
        priority={priority}
        sizes="(max-width: 620px) 34px, 42px"
        className={styles.image}
      />
    </span>
  );
}
