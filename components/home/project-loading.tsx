import styles from "./project-viewer.module.css";

export default function ProjectLoading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span aria-hidden="true" />
      <p>Loading project…</p>
    </div>
  );
}
