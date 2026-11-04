import type { ReactNode } from "react";
import styles from "./text-action-label.module.css";

export default function TextActionLabel({ children, enabled = true, light = false }: { children: ReactNode; enabled?: boolean; light?: boolean }) {
  if (!enabled) return <>{children}</>;
  return <span className={`${styles.label}${light ? ` ${styles.light}` : ""}`} data-text-action-label>{children}</span>;
}
