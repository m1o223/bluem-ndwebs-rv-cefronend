import type { ReactNode } from "react";
import styles from "./text-action-label.module.css";

export default function TextActionLabel({ children, enabled = true, light = false, underline: _underline = true }: { children: ReactNode; enabled?: boolean; light?: boolean; underline?: boolean }) {
  if (!enabled) return <>{children}</>;
  return <span className={`${styles.label}${light ? ` ${styles.light}` : ""}`} data-text-action-label>{children}</span>;
}
