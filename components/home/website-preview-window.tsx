"use client";

import { type KeyboardEvent, useState } from "react";
import PreviewWindowChrome from "./preview-window-chrome";
import styles from "./hero.module.css";

export default function WebsitePreviewWindow() {
  const [flipped, setFlipped] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setControlsVisible(false);
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setControlsVisible(true);
  };

  return (
    <div
      className={`${styles.websiteWindow} ${styles.heroFlipCard}`}
      data-website-preview
      data-flipped={flipped}
      data-controls-visible={controlsVisible}
      role="group"
      tabIndex={0}
      aria-label="Forma website preview mode controls"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        setControlsVisible(true);
      }}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setControlsVisible(false)}
    >
      <div className={styles.heroFlipInner}>
        <div className={`${styles.heroFlipFace} ${styles.heroFlipFront}`}>
          <PreviewWindowChrome title="forma.studio" label="WEBSITE DESIGN" />
          <div className={styles.studioNavigation}>
            <span className={styles.studioBrand}>forma<span>(R)</span></span>
            <span className={styles.studioLinks}>Work <span>Studio</span> <span className={styles.studioContact}>Let's talk -&gt;</span></span>
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
          <div className={styles.studioFooter}><span><i /> Made for what's next.</span><span>Design that works. <b>-&gt;</b></span></div>
        </div>
        <div className={`${styles.heroFlipFace} ${styles.heroFlipBack}`}>
          <PreviewWindowChrome title="forma-card.tsx" label="CODE VIEW" />
          <div className={styles.heroCodeMeta}><span>React</span><span>Next.js</span><span>TypeScript</span><i>CSS MODULE</i></div>
          <pre className={styles.heroCodeBlock}><code>
            <span><b>01</b><em>const</em> FormaHero = () =&gt; (</span>
            <span><b>02</b>  &lt;<i>section</i> className=<strong>&quot;studioHero&quot;</strong>&gt;</span>
            <span><b>03</b>    &lt;<i>BrandNav</i> name=<strong>&quot;forma&quot;</strong> /&gt;</span>
            <span><b>04</b>    &lt;<i>Headline</i>&gt;Ideas into real websites&lt;/<i>Headline</i>&gt;</span>
            <span><b>05</b>    &lt;<i>DesignStudy</i> grid typeScale layout /&gt;</span>
            <span><b>06</b>  &lt;/<i>section</i>&gt;</span>
            <span><b>07</b>);</span>
            <span><b>08</b><em>export default</em> FormaHero;</span>
          </code></pre>
          <div className={styles.heroCodeStatus}><span><i /> Design system mapped to components.</span><span>front-end ready</span></div>
        </div>
      </div>
      <div className={styles.heroModeOverlay} aria-hidden="false">
        <div className={styles.heroModeActions}>
          <button
            type="button"
            className={styles.heroModeButton}
            data-active={!flipped}
            aria-pressed={!flipped}
            onClick={(event) => {
              event.stopPropagation();
              setFlipped(false);
              setControlsVisible(true);
            }}
          >
            View Page
          </button>
          <button
            type="button"
            className={styles.heroModeButton}
            data-active={flipped}
            aria-pressed={flipped}
            onClick={(event) => {
              event.stopPropagation();
              setFlipped(true);
              setControlsVisible(true);
            }}
          >
            View Code
          </button>
        </div>
      </div>
    </div>
  );
}
