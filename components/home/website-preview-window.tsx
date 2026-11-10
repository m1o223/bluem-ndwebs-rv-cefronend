"use client";

import PreviewWindowChrome from "./preview-window-chrome";
import styles from "./hero.module.css";

export default function WebsitePreviewWindow() {
  return (
    <div
      className={`${styles.websiteWindow} ${styles.heroFlipCard}`}
      data-website-preview
    >
      <div className={styles.heroFlipInner}>
        <div className={`${styles.heroFlipFace} ${styles.heroFlipFront}`}>
          <PreviewWindowChrome title="forma.studio" label="WEBSITE DESIGN" />
          <div className={styles.studioNavigation}>
            <span className={styles.studioBrand}>forma<span>(R)</span></span>
            <span className={styles.studioLinks}>Work <span>Studio</span> <span className={styles.studioContact}>Let&apos;s talk -&gt;</span></span>
          </div>
          <div className={styles.studioHero}>
            <div className={styles.studioCopy}>
              <p className={styles.studioEyebrow}>A GOOD IDEA DESERVES A GREAT WEBSITE.</p>
              <p className={styles.studioHeadline}>Ideas<br />into <em>real</em><br />websites.</p>
              <p className={styles.studioDescription}>Strategy. Design. Development.</p>
              <span className={styles.studioButton}>Start a Project <span>-&gt;</span></span>
            </div>
            <div className={styles.designStudy}>
              <div className={styles.studyGrid} />
              <div className={styles.typeTile}><span>01 / TYPE & FORM</span><strong>Aa<span>.</span></strong><div><i /><i /><i /></div></div>
              <div className={styles.layoutTile}><span className={styles.layoutTileTop}><i /><i /><i /></span><div className={styles.layoutTileContent}><span /><div><i /><i /><i /></div></div><p>A little clarity.<br /><strong>A lot of possibility.</strong></p></div>
              <span className={styles.studyNote}>PURPOSE IN EVERY PIXEL.</span>
            </div>
          </div>
          <div className={styles.studioFooter}><span><i /> Made for what&apos;s next.</span><span>Design that works. <b>-&gt;</b></span></div>
        </div>
      </div>
    </div>
  );
}
