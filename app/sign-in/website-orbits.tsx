"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./website-orbits.module.css";

const previews = [
  { id: "fashion", ring: "outer", device: "tablet", phase: 66.6667, tilt: -9, brand: "MORROW", title: "Wear your own story.", category: "THE EVERYDAY COLLECTION", action: "Shop the collection", color: "#37392f", surface: "#f3f2ed", image: null },
  { id: "company", ring: "outer", device: "desktop", phase: 83.3333, tilt: 8, brand: "ASTER", title: "Good ideas. Real impact.", category: "A PARTNER FOR YOUR BUSINESS", action: "Explore our services", color: "#303e69", surface: "#eef1fc", image: "office" },
  { id: "restaurant", ring: "outer", device: "phone", phase: 0, tilt: 9, brand: "JUNE & ATLAS", title: "A seat at our table.", category: "FRESH. LOCAL. TOGETHER.", action: "View the menu", color: "#426448", surface: "#f4f5ed", image: "salad", mobile: true },
  { id: "hotel", ring: "outer", device: "tablet", phase: 16.6667, tilt: -7, brand: "NORTH STAY", title: "Somewhere to slow down.", category: "YOUR NEXT ESCAPE", action: "Find your stay", color: "#2e5a6b", surface: "#edf5f7", image: "alpine", mobile: true },
  { id: "portfolio", ring: "outer", device: "desktop", phase: 33.3333, tilt: -8, brand: "FORMA STUDIO", title: "Spaces with a story.", category: "SELECTED WORK / 2026", action: "View projects", color: "#332f3d", surface: "#f3f0f6", image: "architecture" },
  { id: "fitness", ring: "outer", device: "phone", phase: 50, tilt: 10, brand: "MOVE CLUB", title: "Your next chapter starts here.", category: "MOVE WELL. FEEL STRONG.", action: "Find your class", color: "#315b46", surface: "#eaf2e8", image: "forest" },
  { id: "cafe", ring: "inner", device: "phone", phase: 87.5, tilt: -8, brand: "SLOW COFFEE", title: "Make time for a good cup.", category: "YOUR NEIGHBOURHOOD CAFÉ", action: "Explore the menu", color: "#584a40", surface: "#f4f0eb", image: "drinks" },
  { id: "property", ring: "inner", device: "desktop", phase: 12.5, tilt: 7, brand: "HAVEN HOMES", title: "Find a place to call yours.", category: "A BETTER WAY HOME", action: "Explore homes", color: "#385867", surface: "#eef5f5", image: "house" },
  { id: "clinic", ring: "inner", device: "phone", phase: 37.5, tilt: -7, brand: "NOVA CARE", title: "Care that fits your life.", category: "HERE FOR YOUR HEALTH", action: "Book a visit", color: "#3f6e78", surface: "#ecf7f8", image: null },
  { id: "courses", ring: "inner", device: "tablet", phase: 62.5, tilt: 11, brand: "OPEN ACADEMY", title: "Make room for what’s next.", category: "LEARN AT YOUR OWN PACE", action: "Find your course", color: "#584b78", surface: "#f2eff8", image: "workspace" },
] as const;

function WebsiteOrbits() {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const update = () => setPaused(document.hidden);
    update(); document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    const layer = root.current;
    const stage = layer?.parentElement;
    const area = stage?.querySelector<HTMLElement>("[data-auth-card]");
    if (!layer || !stage || !area) return;
    const devices = [...layer.querySelectorAll<HTMLElement>("[data-preview]")];
    let guard: IntersectionObserver | undefined;
    const protectForm = () => {
      guard?.disconnect();
      const bounds = stage.getBoundingClientRect();
      const form = area.getBoundingClientRect();
      const gap = bounds.width < 768 ? 28 : 40;
      const top = Math.max(0, form.top - bounds.top - gap);
      const right = Math.max(0, bounds.right - form.right - gap);
      const bottom = Math.max(0, bounds.bottom - form.bottom - gap);
      const left = Math.max(0, form.left - bounds.left - gap);
      // Fade entire previews before they reach the form, rather than blurring or masking its surroundings.
      guard = new IntersectionObserver(entries => entries.forEach(entry => {
        (entry.target as HTMLElement).dataset.obscured = String(entry.isIntersecting);
      }), { root: stage, rootMargin: `${-top}px ${-right}px ${-bottom}px ${-left}px`, threshold: 0 });
      devices.forEach(device => {
        const box = device.getBoundingClientRect();
        device.dataset.obscured = String(box.right >= form.left - gap && box.left <= form.right + gap && box.bottom >= form.top - gap && box.top <= form.bottom + gap);
        guard!.observe(device);
      });
      layer.dataset.ready = "true";
    };
    const observer = new ResizeObserver(protectForm);
    observer.observe(area); observer.observe(stage); protectForm();
    return () => { observer.disconnect(); guard?.disconnect(); };
  }, []);
  return <div ref={root} className={styles.orbits} data-auth-orbits data-paused={paused} aria-hidden="true" dir="ltr">
    {previews.map(item => <div key={item.id} className={styles.device} data-preview={item.id} data-ring={item.ring} data-device={item.device} data-mobile={"mobile" in item && item.mobile} style={{ "--phase": item.phase, "--tilt": `${item.tilt}deg`, "--ink": item.color, "--surface": item.surface } as CSSProperties}>
      <div className={styles.frame}>
        <div className={styles.chrome}><i /><i /><i /><span>{item.brand.toLowerCase().replaceAll(" ", "")}.studio</span></div>
        <div className={styles.website}>
          <div className={styles.nav}><b>{item.brand}</b><span>Explore &nbsp; ☰</span></div>
          <div className={styles.content}><small>{item.category}</small><h2>{item.title}</h2>
            {item.image ? <Image src={`/images/portfolio/${item.image}.webp`} width={280} height={180} sizes="220px" alt="" className={styles.photo} /> : item.id === "fashion" ? <div className={styles.collection}><span /><span /><span /></div> : <div className={styles.appointment}><strong>Your wellbeing comes first.</strong><div>M &nbsp; T &nbsp; W &nbsp; T &nbsp; F</div><p>09:00 &nbsp; 10:30 &nbsp; 14:00</p></div>}
            <span className={styles.cta}>{item.action} &nbsp; →</span>
          </div>
          <div className={styles.details}><span>Thoughtfully made.</span><span>Discover more ↗</span></div>
        </div>
      </div>
      {item.device === "desktop" && <div className={styles.base} />}
    </div>)}
  </div>;
}

export default memo(WebsiteOrbits);
