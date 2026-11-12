"use client";

import CodePreviewWindow from "./code-preview-window";
import WebsitePreviewWindow from "./website-preview-window";
import MiniFeatureCard from "./mini-feature-card";
import styles from "./hero.module.css";

export default function HeroVisual() {
  return (
    <figure
      className={styles.visual}
      role="group"
      aria-label="Website design and development: a polished website layered in front of its React and TypeScript code, with small design and performance panels."
      data-hero-visual
    >
      <div className={styles.windows}>
        <div className={`${styles.boardMover} ${styles.codeMover}`} aria-hidden="true">
          <CodePreviewWindow />
        </div>
        <div className={`${styles.boardMover} ${styles.designMover}`}>
          <WebsitePreviewWindow />
        </div>
        <MiniFeatureCard variant="design" />
        <MiniFeatureCard variant="performance" />
        <p className={styles.visualCaption}><span /> DESIGN + DEVELOPMENT, TOGETHER.</p>
      </div>
    </figure>
  );
}
