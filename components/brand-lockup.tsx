import { BlueMindLogo } from "./blue-mind-logo";
import styles from "./brand-lockup.module.css";

type BrandLockupProps = {
  serviceName?: string;
  serviceClassName?: string;
  className?: string;
  logoClassName?: string;
  priority?: boolean;
  solidLogo?: boolean;
};

export function BrandLockup({
  serviceName = "Web Service",
  serviceClassName = "",
  className = "",
  logoClassName = "",
  priority = false,
  solidLogo = false,
}: BrandLockupProps) {
  return (
    <span className={`${styles.lockup} ${className}`}>
      <BlueMindLogo className={`${styles.logo} ${logoClassName}`} priority={priority} solid={solidLogo} />
      <span className={styles.text}>
        <span className={styles.name}>BlueMind</span>
        <span className={`${styles.service} ${serviceClassName}`}>{serviceName}</span>
      </span>
    </span>
  );
}
