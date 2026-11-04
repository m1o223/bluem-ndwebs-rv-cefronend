"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocalization } from "../localization-provider";
import { workProcessCopy } from "./work-process-copy";
import styles from "./work-process.module.css";

export default function WorkProcess() {
  const { locale } = useLocalization();
  const copy = workProcessCopy[locale];
  const cardRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const playing = inView && visible && !paused && !reducedMotion;
  const rtl = locale === "ar";

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motion.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.5), { threshold: [0, 0.5] });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  function navigate(direction: number) {
    setPaused(true);
    setStep(current => (current + direction + copy.steps.length) % copy.steps.length);
  }

  return (
    <section id="home-how-we-work" className={styles.section} aria-labelledby="home-work-title" lang={locale} dir={rtl ? "rtl" : "ltr"} data-no-translate>
      <div className={styles.inner}>
        <h2 id="home-work-title" className={styles.title}>{copy.title}</h2>
        <div ref={cardRef} className={styles.card} data-work-card data-playing={playing} data-manual={paused || reducedMotion}>
          <div className={styles.textArea} aria-live={playing ? "off" : "polite"} aria-atomic="true">
            <p key={`${locale}-${step}`} className={styles.sentence} data-work-step={step + 1} onAnimationEnd={() => {
              // The CSS timeline owns both the text transition and step cadence.
              if (playing) setStep(current => (current + 1) % copy.steps.length);
            }}>{copy.steps[step]}</p>
          </div>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.control} onClick={() => navigate(-1)} aria-label={copy.previous} title={copy.previous} data-work-previous>
            {rtl ? <ArrowRight size={18} aria-hidden="true" /> : <ArrowLeft size={18} aria-hidden="true" />}
          </button>
          <span className={styles.counter} dir="ltr" aria-hidden="true">{String(step + 1).padStart(2, "0")} / 10</span>
          <button type="button" className={styles.control} onClick={() => navigate(1)} aria-label={copy.next} title={copy.next} data-work-next>
            {rtl ? <ArrowLeft size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
          </button>
          {!reducedMotion && <button type="button" className={styles.control} onClick={() => setPaused(current => !current)} aria-label={paused ? copy.play : copy.pause} title={paused ? copy.play : copy.pause} data-work-pause>
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>}
        </div>
        <p className={styles.description}>{copy.description}</p>
        <Link href="/quote" className={styles.cta}>{copy.action}{rtl ? <ArrowLeft size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}</Link>
      </div>
    </section>
  );
}
