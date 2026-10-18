"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useLocalization } from "../../components/localization-provider";
import { sections } from "./sections";
import type { StructureScene } from "./structure-scene";
import styles from "./about.module.css";

const controls = {
  en: { previous: "Previous section", next: "Next section", label: "About BlueMind" },
  sv: { previous: "F\u00f6reg\u00e5ende avsnitt", next: "N\u00e4sta avsnitt", label: "Om BlueMind" },
  ar: { previous: "\u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u0633\u0627\u0628\u0642", next: "\u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u062a\u0627\u0644\u064a", label: "\u0639\u0646 BlueMind" },
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
  const [turn, setTurn] = useState(0);
  const selected = (turn % sections.length + sections.length) % sections.length;
  const currentTurn = useRef(0);
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; startX: number; startY: number; turn: number; position: number; moved: boolean; distance: number } | null>(null);
  const [reduced, setReduced] = useState(true);
  const [wide, setWide] = useState(false);
  const [hosts, setHosts] = useState<HTMLElement[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const engine = useRef<StructureScene | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  function settle(next: number) {
    currentTurn.current = next;
    setTurn(next);
    locked.current = Boolean(engine.current && !reduced);
    setBusy(locked.current);
    engine.current?.select(next, reduced, () => { locked.current = false; setBusy(false); });
  }
  function move(direction: number) { if (!locked.current && !drag.current) settle(currentTurn.current + direction); }
  function finishDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (gesture.moved) settle(cancelled ? gesture.turn : Math.round(gesture.position));
  }

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
    if (!wide || !stage.current) return;
    let cancelled = false;
    let scene: StructureScene | undefined;
    import("./structure-scene").then(({ createStructureScene }) => {
      if (cancelled || !stage.current) return;
      scene = createStructureScene(stage.current, styles.face);
      engine.current = scene;
      scene.select(currentTurn.current, true);
      setHosts(scene.hosts);
    }).catch(() => { if (!cancelled) setHosts([]); });
    return () => { cancelled = true; scene?.dispose(); engine.current = null; drag.current = null; locked.current = false; setBusy(false); setDragging(false); setHosts([]); };
  }, [wide]);

  useEffect(() => {
    if (reduced) engine.current?.select(currentTurn.current, true, () => { locked.current = false; setBusy(false); });
  }, [reduced]);

  return <section className={styles.experience} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={text.label} data-selected={selected} data-turn={turn} data-renderer={hosts.length ? "css3d" : "flat"}
    onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}>
    <div className={styles.scene} data-dragging={dragging}
      onPointerDown={event => {
        if (event.pointerType !== "mouse" || event.button !== 0 || locked.current || !engine.current || !(event.target as Element).closest("article")) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, turn: currentTurn.current, position: currentTurn.current, moved: false, distance: engine.current.dragDistance() };
      }}
      onPointerMove={event => {
        const gesture = drag.current;
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = gesture.startX - event.clientX;
        if (!gesture.moved && (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(event.clientY - gesture.startY))) return;
        gesture.moved = true;
        setDragging(true);
        gesture.position = gesture.turn + Math.max(-1, Math.min(1, dx / gesture.distance));
        if (!reduced) engine.current?.preview(gesture.position);
      }}
      onPointerUp={event => finishDrag(event)} onPointerCancel={event => finishDrag(event, true)} onLostPointerCapture={event => finishDrag(event, true)}
      onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchEnd={event => {
        if (touch.current) {
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
        }
        touch.current = null;
      }} onTouchCancel={() => { touch.current = null; }}>
      <div className={styles.stage} ref={stage} aria-hidden={hosts.length ? undefined : true} />
      {hosts.length ? hosts.map((host, index) => createPortal(<Panel index={index} active={selected === index} />, host, sections[index].id)) :
        <div className={styles.flat}>{sections.map((section, index) => <div key={section.id} hidden={selected !== index}><Panel index={index} active={selected === index} /></div>)}</div>}
    </div>
    <div className={styles.controls} data-no-translate>
      <button type="button" className={styles.control} aria-disabled={busy} aria-label={text.previous} title={text.previous} onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
      <div className={styles.caption} aria-live="polite" aria-atomic="true"><span>0{selected + 1} / 03</span><strong dir="auto">{translate(sections[selected].title)}</strong></div>
      <button type="button" className={styles.control} aria-disabled={busy} aria-label={text.next} title={text.next} onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
    </div>
  </section>;
}
