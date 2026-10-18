"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import { useLocalization } from "../localization-provider";
import type { CarouselScene } from "./carousel-scene";
import styles from "./circular-carousel.module.css";

export type CarouselItem = { title: string; text: string } & (
  { icon: LucideIcon; image?: never } |
  { image: { src: string; width: number; height: number }; icon?: never }
);

type Props = {
  items: readonly CarouselItem[];
  label: string;
  navigationLabel: string;
  stageTestId: string;
};

export default function CircularCarousel({ items, label, navigationLabel, stageTestId }: Props) {
  const { locale, translate } = useLocalization();
  const count = items.length;
  const total = String(count).padStart(2, "0");
  const wrap = (value: number) => (value % count + count) % count;
  const [turn, setTurn] = useState(0);
  const [hosts, setHosts] = useState<HTMLElement[]>([]);
  const [desktop, setDesktop] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [busy, setBusy] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const scene = useRef<CarouselScene | null>(null);
  const lock = useRef(false);
  const currentTurn = useRef(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const active = wrap(turn);

  useEffect(() => {
    const wide = matchMedia("(min-width: 700px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setDesktop(wide.matches); setReduced(motion.matches); };
    sync();
    wide.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => { wide.removeEventListener("change", sync); motion.removeEventListener("change", sync); };
  }, []);

  useEffect(() => {
    if (!desktop || !stage.current) return;
    const container = stage.current;
    let cancelled = false;
    import("./carousel-scene").then(({ createCarouselScene }) => {
      if (cancelled) return;
      const instance = createCarouselScene(container, styles.face, count);
      scene.current = instance;
      instance.select(currentTurn.current, true, () => {});
      setHosts(instance.hosts);
    }).catch(() => { if (!cancelled) setHosts([]); });
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
      setHosts([]);
      lock.current = false;
      setBusy(false);
    };
  }, [desktop, count]);

  useEffect(() => {
    if (!scene.current) { lock.current = false; setBusy(false); return; }
    scene.current.select(turn, reduced, () => { lock.current = false; setBusy(false); });
  }, [turn, reduced]);

  function move(delta: number) {
    if (lock.current || !delta) return;
    lock.current = Boolean(scene.current && !reduced);
    setBusy(lock.current);
    currentTurn.current += delta;
    setTurn(currentTurn.current);
  }

  function card(index: number, projected: boolean) {
    const step = items[index];
    const Icon = step.icon;
    let delta = wrap(index - active);
    if (delta > count / 2) delta -= count;
    const neighbor = Math.abs(delta) === 1;
    return <article className={styles.panel} data-active={index === active} data-step={index + 1}
      aria-hidden={projected && index !== active} dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className={styles.cardTop}><span>{String(index + 1).padStart(2, "0")} / {total}</span><span className={styles.brand}>BlueMind</span></div>
      {Icon ? <Icon className={styles.stepIcon} size={34} strokeWidth={1.5} aria-hidden="true" /> :
        <Image src={step.image!.src} width={step.image!.width} height={step.image!.height} alt="" aria-hidden="true" unoptimized className={`${styles.stepIcon} ${styles.imageIcon}`} />}
      <h2>{translate(step.title)}</h2>
      <p>{translate(step.text)}</p>
      <div className={styles.detail} aria-hidden="true"><span /><span /><span /></div>
      {projected && neighbor && <button type="button" className={styles.sideTarget} tabIndex={-1} disabled={busy}
        aria-label={`${translate("Select step")} ${index + 1}`} onClick={() => move(delta)} />}
    </article>;
  }

  return <div className={styles.carousel} data-no-translate data-renderer={hosts.length ? "css3d" : "flat"} data-selected={active} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={translate(label)}
      onKeyDown={event => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onTouchStart={event => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
      onTouchEnd={event => {
        const point = event.changedTouches[0];
        if (touch.current) {
          const dx = point.clientX - touch.current.x;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(point.clientY - touch.current.y)) move(dx < 0 ? 1 : -1);
        }
        touch.current = null;
      }} onTouchCancel={() => { touch.current = null; }}>
      <div className={styles.stage} ref={stage} data-testid={stageTestId} hidden={!desktop} />
      {hosts.length ? hosts.map((host, index) => createPortal(card(index, true), host, index)) : <div className={styles.fallback}>{card(active, false)}</div>}
      <nav className={styles.controls} aria-label={translate(navigationLabel)}>
        <button className={styles.control} type="button" aria-label={translate("Previous step")} aria-disabled={busy} onClick={() => move(-1)}><ArrowLeft size={20} /></button>
        <output className={styles.indicator} aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, "0")} <span>/ {total}</span></output>
        <button className={styles.control} type="button" aria-label={translate("Next step")} aria-disabled={busy} onClick={() => move(1)}><ArrowRight size={20} /></button>
      </nav>
    </div>;
}
