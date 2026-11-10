import type { ReactNode } from "react";
import styles from "./text-action-label.module.css";

export default function TextActionLabel({ children, enabled = true, light = false, underline = true }: { children: ReactNode; enabled?: boolean; light?: boolean; underline?: boolean }) {
  if (!enabled) return <>{children}</>;
  return <span className={`${styles.label}${light ? ` ${styles.light}` : ""}${underline ? "" : ` ${styles.noUnderline}`}`} data-text-action-label>{children}</span>;
}
