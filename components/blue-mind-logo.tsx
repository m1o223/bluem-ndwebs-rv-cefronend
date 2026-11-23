import Image from "next/image";
import styles from "./blue-mind-logo.module.css";

type BlueMindLogoProps = {
  className?: string;
  priority?: boolean;
  solid?: boolean;
};

export function BlueMindLogo({ className = "", priority = false, solid = false }: BlueMindLogoProps) {
  return (
    <span className={`${styles.logo} ${className}`} aria-hidden="true" data-bluemind-logo data-solid={solid ? "true" : undefined}>
      <Image
        src="/images/brand/bluemind-new-logo-transparent.png"
        width={1280}
        height={1280}
        alt=""
        priority={priority}
        sizes="(max-width: 430px) 52px, (max-width: 620px) 58px, 72px"
        className={styles.image}
      />
    </span>
  );
}
