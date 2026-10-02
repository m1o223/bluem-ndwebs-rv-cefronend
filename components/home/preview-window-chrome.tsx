import styles from "./hero.module.css";

export default function PreviewWindowChrome({ title, label }: { title: string; label: string }) {
  return (
    <div className={styles.windowChrome}>
      <span className={styles.windowDots}><i /><i /><i /></span>
      <span className={styles.windowTitle}>{title}</span>
      <span className={styles.windowLabel}>{label}</span>
    </div>
  );
}
