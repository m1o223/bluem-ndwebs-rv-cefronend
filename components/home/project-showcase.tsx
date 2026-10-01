"use client";

import Image from "next/image";
import { useState } from "react";
import InteractiveProjectViewer from "./project-viewer";
import styles from "./home.module.css";

export default function ProjectShowcase() {
  const [open, setOpen] = useState(false);
  return <section id="selected-work" className={styles.showcase} aria-labelledby="work-title"><div className={styles.container}>
    <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>DESIGN IN ACTION</p><h2 id="work-title">Selected work<span className={styles.bluePeriod}>.</span></h2></div><p>Explore some of the digital<br className={styles.desktopBreak} /> experiences we build.</p></div>
    <button className={styles.projectCard} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label="Explore NORTH SEA interactive project">
      <div className={styles.browserToolbar}><span className={styles.browserDots} aria-hidden="true"><i /><i /><i /></span><span>north sea — a digital concept</span><span className={styles.windowArrow} aria-hidden="true">↗</span></div>
      <div className={styles.projectScreen}><Image src="/images/north-sea-yacht.jpg" alt="" fill sizes="(max-width: 760px) 94vw, 1140px" className={styles.previewPhoto} /><div className={styles.previewShade} />
        <div className={styles.previewNav}><span>NORTH SEA</span><span>EXPLORE THE UNKNOWN <span aria-hidden="true">☰</span></span></div>
        <div className={styles.previewCopy}><span>BEYOND THE EVERYDAY</span><h3>A different<br />kind of freedom.</h3><span className={styles.previewMiniButton}>Explore the collection <span aria-hidden="true">↗</span></span></div>
        <span className={styles.exploreBadge}>Explore Project <span aria-hidden="true">↗</span></span>
      </div>
    </button>
    <div className={styles.projectCaption}><div><span className={styles.projectNumber}>01</span><h3>NORTH SEA</h3><span className={styles.conceptLabel}>FICTIONAL CONCEPT</span></div><p>Luxury Marine <span>·</span> Web Design & Development</p></div>
    <p className={styles.previewHint}><span className={styles.blueDot} /> More than a preview. Click to step inside.</p>
  </div><InteractiveProjectViewer open={open} onClose={() => setOpen(false)} /></section>;
}
