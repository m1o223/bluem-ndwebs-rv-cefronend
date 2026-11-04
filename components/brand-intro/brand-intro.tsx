"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { BrandLockup } from "../brand-lockup";
import { BlueMindLogo } from "../blue-mind-logo";
import { useLocalization } from "../localization-provider";
import { INTRO_DURATION, INTRO_ID, INTRO_STORAGE_KEY, createIntroBootstrap, introVariables, mobileWordCount, timeline, words } from "./intro-config";
import styles from "./brand-intro.module.css";

declare global {
  interface Window { __blueMindIntro?: { started: number; playing: boolean } }
}

const entrances = [[-80, -65], [80, -65], [-80, 65], [80, 65], [-90, 0], [90, 0], [0, -85], [0, 85]];
const skipLabels = { en: "Skip Intro", sv: "Hoppa \u00f6ver intro", ar: "\u062a\u062e\u0637\u064a \u0627\u0644\u0645\u0642\u062f\u0645\u0629" };

export default function BrandIntro({ replayOnRefresh = false }: { replayOnRefresh?: boolean }) {
  const [ended, setEnded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pageAnimations = useRef<Animation[]>([]);
  const { locale } = useLocalization();
  const finish = useCallback(() => {
    const focused = root.current?.contains(document.activeElement);
    if (window.__blueMindIntro) window.__blueMindIntro.playing = false;
    try { localStorage.setItem(INTRO_STORAGE_KEY, "complete"); } catch { /* Storage may be disabled. */ }
    root.current?.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    pageAnimations.current.forEach(animation => animation.cancel());
    setEnded(true);
    if (focused) document.querySelector<HTMLAnchorElement>('header a[href="/"]')?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (ended) return;
    const element = root.current;
    const state = window.__blueMindIntro;
    if (!state?.playing || !element || getComputedStyle(element).display === "none") {
      try { localStorage.setItem(INTRO_STORAGE_KEY, "complete"); } catch { /* Keep navigation usable without storage. */ }
      setEnded(true);
      return;
    }
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    pageAnimations.current = document.getAnimations().filter(animation => animation instanceof CSSAnimation && animation.animationName === "bluemindIntroHome");
    // Anchor every layer to one document clock, including a late hydration.
    [...element.getAnimations({ subtree: true }), ...pageAnimations.current].forEach(animation => { animation.startTime = state.started; });
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
      pageAnimations.current.forEach(animation => animation.cancel());
    };
  }, [finish, ended]);

  if (ended) return null;

  return <>
    <link rel="preload" as="image" href="/images/brand/bluemind-original-logo-transparent.png" />
    <style id={`${INTRO_ID}-gate`}>{"/* First-visit animation gate. */"}</style>
    <div id={INTRO_ID} ref={root} className={styles.root} style={introVariables as CSSProperties} data-no-translate onAnimationEnd={event => { if (event.target === event.currentTarget) finish(); }}>
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.art} aria-hidden="true">
        <div className={styles.brandGroup} data-intro-brand>
          <div className={styles.logoTravel}>
            <div className={styles.orbit} data-intro-orbit>
              <div className={styles.wordRing} data-intro-words>
                {words.map((word, index) => {
                  const [x, y] = entrances[index % entrances.length];
                  const delay = 40 + index * 28;
                  const angle = index * 360 / words.length;
                  const mobileAngle = index * 360 / mobileWordCount;
                  return <span key={word} className={styles.slot} style={{
                    "--x": Math.sin(angle * Math.PI / 180), "--y": -Math.cos(angle * Math.PI / 180), "--angle": `${angle}deg`,
                    "--mobile-x": Math.sin(mobileAngle * Math.PI / 180), "--mobile-y": -Math.cos(mobileAngle * Math.PI / 180), "--mobile-angle": `${mobileAngle}deg`,
                  } as CSSProperties}>
                    <span className={styles.arrival} style={{ "--from-x": `${x}vw`, "--from-y": `${y}vh`, "--delay": `${delay}ms`, "--travel": `${timeline.formation - delay}ms` } as CSSProperties}>
                      <span className={styles.word} data-intro-word>{word}</span>
                    </span>
                  </span>;
                })}
              </div>
              <div className={styles.logoLayer} data-intro-logo>
                <BlueMindLogo className={styles.symbol} priority solid />
              </div>
            </div>
          </div>
          <BrandLockup className={styles.wordmark} logoClassName={styles.hiddenLogo} />
        </div>
      </div>
      <button type="button" className={styles.skip} onClick={finish}>{skipLabels[locale]}</button>
    </div>
    <script dangerouslySetInnerHTML={{ __html: createIntroBootstrap(replayOnRefresh) }} />
  </>;
}
