import styles from "./test-environment-banner.module.css";

export default function TestEnvironmentBanner() {
  return (
    <div className={styles.banner} role="status" aria-label="Test environment">
      <strong>BlueMind Web Service — Test</strong>
      <span>Test environment · no live customer data</span>
    </div>
  );
}
