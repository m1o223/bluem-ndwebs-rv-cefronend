"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Pause, Play } from "lucide-react";
import { useLocalization } from "../../components/localization-provider";
import { sections } from "./sections";
import type { StructureScene } from "./structure-scene";
import styles from "./about.module.css";

const controls = {
  en: { previous: "Previous section", next: "Next section", pause: "Pause automatic rotation", play: "Play automatic rotation", label: "About BlueMind", reduced: "Automatic rotation disabled for reduced motion" },
  sv: { previous: "F\u00f6reg\u00e5ende avsnitt", next: "N\u00e4sta avsnitt", pause: "Pausa automatisk rotation", play: "Starta automatisk rotation", label: "Om BlueMind", reduced: "Automatisk rotation avst\u00e4ngd vid minskad r\u00f6relse" },
  ar: { previous: "\u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u0633\u0627\u0628\u0642", next: "\u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u062a\u0627\u0644\u064a", pause: "\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u062f\u0648\u0631\u0627\u0646 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a", play: "\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u062f\u0648\u0631\u0627\u0646 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a", label: "\u0639\u0646 BlueMind", reduced: "\u0627\u0644\u062f\u0648\u0631\u0627\u0646 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a \u0645\u0639\u0637\u0644 \u0644\u062a\u0642\u0644\u064a\u0644 \u0627\u0644\u062d\u0631\u0643\u0629" },
};

function Panel({ index, active }: { index: number; active: boolean }) {
  const { locale, translate } = useLocalization();
  const section = sections[index];
  return <article className={styles.panel} data-active={active} aria-hidden={!active} aria-roledescription="slide" aria-label={`${index + 1} / 3`} data-no-translate>
    <div className={styles.panelTop}>
      <span className={styles.number}>0{index + 1}</span>
      <img src={section.icon.src} width={section.icon.width} height={section.icon.height} alt="" className={styles.art} draggable={false} />
    </div>
    <h2 dir={locale === "ar" ? "rtl" : "ltr"}>{translate(section.title)}{section.question ? "?" : ""}</h2>
    <ul dir={locale === "ar" ? "rtl" : "ltr"}>
      {section.points.map(point => <li key={point}><Check size={17} strokeWidth={1.7} aria-hidden="true" /><span>{translate(point)}</span></li>)}
    </ul>
    <span className={styles.panelFoot} aria-hidden="true">BLUEMIND / 0{index + 1}</span>
  </article>;
}

export default function AboutStructure() {
  const { locale, translate } = useLocalization();
  const text = controls[locale];
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [wide, setWide] = useState(false);
  const [hosts, setHosts] = useState<HTMLElement[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const region = useRef<HTMLElement>(null);
  const engine = useRef<StructureScene | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [touching, setTouching] = useState(false);
  const running = !paused && !hovered && !focused && !touching && !reduced && visible;
  const move = (direction: number) => setSelected(current => (current + direction + sections.length) % sections.length);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const width = matchMedia("(min-width: 1000px)");
    const update = () => { setReduced(motion.matches); setWide(width.matches && (window.visualViewport?.scale ?? 1) === 1); };
    update();
    motion.addEventListener("change", update);
    width.addEventListener("change", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => { motion.removeEventListener("change", update); width.removeEventListener("change", update); window.visualViewport?.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    if (region.current) observer.observe(region.current);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  useEffect(() => {
    if (!wide || !stage.current) return;
    let cancelled = false;
    let scene: StructureScene | undefined;
    import("./structure-scene").then(({ createStructureScene }) => {
      if (cancelled || !stage.current) return;
      scene = createStructureScene(stage.current, styles.face);
      engine.current = scene;
      setHosts(scene.hosts);
    }).catch(() => { if (!cancelled) setHosts([]); });
    return () => { cancelled = true; scene?.dispose(); engine.current = null; setHosts([]); };
  }, [wide]);

  useEffect(() => { engine.current?.select(selected, reduced); }, [selected, reduced, hosts]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => move(1), 3000);
    return () => clearTimeout(timer);
  }, [running, selected]);

  return <section ref={region} className={styles.experience} role="region" aria-roledescription="carousel" aria-label={text.label} data-selected={selected} data-renderer={hosts.length ? "css3d" : "flat"}
    onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}>
    <div className={styles.scene} onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; setTouching(true); }}
      onTouchEnd={event => {
        if (touch.current) {
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
        }
        touch.current = null; setTouching(false);
      }} onTouchCancel={() => { touch.current = null; setTouching(false); }}>
      <div className={styles.stage} ref={stage} aria-hidden={hosts.length ? undefined : true} />
      {hosts.length ? hosts.map((host, index) => createPortal(<Panel index={index} active={selected === index} />, host, sections[index].id)) :
        <div className={styles.flat}>{sections.map((section, index) => <div key={section.id} hidden={selected !== index}><Panel index={index} active={selected === index} /></div>)}</div>}
    </div>
    <div className={styles.controls} data-no-translate>
      <button type="button" className={styles.control} aria-label={text.previous} title={text.previous} onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
      <div className={styles.caption} aria-live={running ? "off" : "polite"} aria-atomic="true"><span>0{selected + 1} / 03</span><strong dir="auto">{translate(sections[selected].title)}</strong></div>
      <button type="button" className={styles.control} aria-label={text.next} title={text.next} onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
      <span className={styles.divider} aria-hidden="true" />
      <button type="button" className={styles.control} aria-label={reduced ? text.reduced : paused ? text.play : text.pause} title={reduced ? text.reduced : paused ? text.play : text.pause} disabled={reduced} onClick={() => setPaused(value => !value)}>{paused || reduced ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}</button>
    </div>
  </section>;
}
