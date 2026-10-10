import styles from "./hero.module.css";

export default function MiniFeatureCard({ variant }: { variant: "design" | "performance" }) {
  if (variant === "design") {
    return (
      <div className={`${styles.miniCard} ${styles.designCard}`} data-mini-card="design">
        <div className={styles.miniHeading}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" /><path d="M1.5 5.5h13M6 5.5v9" stroke="currentColor" /></svg><span>Website Design</span><i /></div>
        <div className={styles.miniLayout}><span /><div><i /><i /></div></div>
        <p>Every detail, considered.</p>
      </div>
    );
  }
  return (
    <div className={`${styles.miniCard} ${styles.performanceCard}`} data-mini-card="performance">
      <div className={styles.miniHeading}><span>Built to perform</span><span className={styles.miniArrow}>↗</span></div>
      <svg className={styles.performanceGraph} viewBox="0 0 136 40" fill="none"><path d="M0 35h136M0 18h136" stroke="#edf0f5" /><path d="m2 33 23-7 20 3 22-14 22 4 21-12 23-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="133" cy="3" r="3" fill="currentColor" /></svg>
      <p><span>Fast.</span> Responsive.</p>
    </div>
  );
}
