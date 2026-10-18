"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { BrandLockup } from "../brand-lockup";
import { useLocalization } from "../localization-provider";
import { INTRO_DURATION, INTRO_ID, INTRO_STORAGE_KEY, introBootstrap, words } from "./intro-config";
import styles from "./brand-intro.module.css";

declare global {
  interface Window { __blueMindIntro?: { started: number; playing: boolean } }
}

const entrances = [[-80, -65], [80, -65], [-80, 65], [80, 65], [-90, 0], [90, 0], [0, -85], [0, 85]];
const skipLabels = { en: "Skip Intro", sv: "Hoppa \u00f6ver intro", ar: "\u062a\u062e\u0637\u064a \u0627\u0644\u0645\u0642\u062f\u0645\u0629" };

export default function BrandIntro() {
  const [ended, setEnded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { locale } = useLocalization();
  const finish = useCallback(() => {
    const focused = root.current?.contains(document.activeElement);
    if (window.__blueMindIntro) window.__blueMindIntro.playing = false;
    try { localStorage.setItem(INTRO_STORAGE_KEY, "complete"); } catch { /* Storage may be disabled. */ }
    root.current?.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    setEnded(true);
    if (focused) document.querySelector<HTMLAnchorElement>('header a[href="/"]')?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const element = root.current;
    const state = window.__blueMindIntro;
    if (!state?.playing || !element || getComputedStyle(element).display === "none") {
      try { localStorage.setItem(INTRO_STORAGE_KEY, "complete"); } catch { /* Keep navigation usable without storage. */ }
      setEnded(true);
      return;
    }
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => { if (motion.matches) finish(); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") finish(); };
    // Keyboard and assistive-technology navigation can reach the real page immediately.
    const onFocus = (event: FocusEvent) => { if (!element.contains(event.target as Node)) finish(); };
    const onWheel = (event: WheelEvent) => event.preventDefault();
    const timer = window.setTimeout(finish, Math.max(0, INTRO_DURATION - (performance.now() - state.started)) + 80);
    motion.addEventListener("change", onMotion);
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    element.addEventListener("wheel", onWheel, { passive: false });
    onMotion();
    return () => {
      clearTimeout(timer);
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      element.removeEventListener("wheel", onWheel);
    };
  }, [finish]);

  if (ended) return null;

  return <>
    <link rel="preload" as="image" href="/images/brand/bluemind-original-logo-transparent.png" />
    <style id={`${INTRO_ID}-gate`}>{"/* First-visit animation gate. */"}</style>
    <div id={INTRO_ID} ref={root} className={styles.root} data-no-translate>
      <svg className={styles.veil} width="100%" height="100%" aria-hidden="true" focusable="false">
        <defs><mask id="bluemind-intro-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" style={{ maskType: "luminance" }}>
          <rect width="100%" height="100%" fill="white" />
          <circle data-intro-reveal className={styles.aperture} cx="50%" cy="50%" r="75%" fill="black" onAnimationEnd={finish} />
        </mask></defs>
        <rect width="100%" height="100%" fill="#fff" mask="url(#bluemind-intro-reveal)" />
      </svg>
      <div className={styles.art} aria-hidden="true">
        <div className={styles.contraction}>
          <div className={styles.orbit} data-intro-orbit>
            {words.map((word, index) => {
              const [x, y] = entrances[index % entrances.length];
              const delay = 40 + index * 18;
              return <span key={word} className={styles.slot} style={{ "--angle": `${index * 360 / words.length}deg`, "--mobile-angle": `${index * 36}deg` } as CSSProperties}>
                <span className={styles.arrival} data-intro-word style={{ "--from-x": `${x}vw`, "--from-y": `${y}vh`, "--delay": `${delay}ms`, "--travel": `${1200 - delay}ms` } as CSSProperties}>
                  <span className={styles.word}>{word}</span>
                </span>
              </span>;
            })}
          </div>
        </div>
        <div className={styles.brandGroup} data-intro-brand>
          <BrandLockup className={styles.lockup} logoClassName={styles.symbol} priority solidLogo />
        </div>
      </div>
      <button type="button" className={styles.skip} onClick={finish}>{skipLabels[locale]}</button>
    </div>
    <script dangerouslySetInnerHTML={{ __html: introBootstrap }} />
  </>;
}
