import CodePreviewWindow from "./code-preview-window";
import WebsitePreviewWindow from "./website-preview-window";
import MiniFeatureCard from "./mini-feature-card";
import styles from "./hero.module.css";

export default function HeroVisual() {
  return (
    <figure className={styles.visual} role="img" aria-label="Website design and development: a polished website layered in front of its React and TypeScript code, with small design and performance panels." data-hero-visual>
      <div className={styles.windows} aria-hidden="true">
        <CodePreviewWindow />
        <WebsitePreviewWindow />
        <MiniFeatureCard variant="design" />
        <MiniFeatureCard variant="performance" />
        <p className={styles.visualCaption}><span /> DESIGN + DEVELOPMENT, TOGETHER.</p>
      </div>
    </figure>
  );
}
