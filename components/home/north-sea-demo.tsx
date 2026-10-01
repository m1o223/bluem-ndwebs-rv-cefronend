"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./demo.module.css";

const models = [
  { name: "The Coastal 38", length: "11.6 m", guests: "8 guests", range: "Coastal explorer", description: "Spontaneous days. Unforgettable coastlines. Our most agile cruiser brings you closer to the places that matter." },
  { name: "The Voyager 52", length: "15.8 m", guests: "10 guests", range: "Weekend voyager", description: "Room to roam, space to unwind. A considered balance of open-air living and quiet comfort for longer journeys." },
  { name: "The Horizon 68", length: "20.7 m", guests: "12 guests", range: "Open-water flagship", description: "An expansive perspective on life at sea. Generous decks and effortless refinement, from horizon to horizon." },
];

export default function NorthSeaDemo() {
  const viewport = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [viewing, setViewing] = useState(false);
  function explore(id: string) {
    setMenuOpen(false);
    const target = viewport.current?.querySelector<HTMLElement>(`#${id}`);
    if (target && viewport.current) {
      const top = target.offsetTop - 84;
      viewport.current.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
  }
  return <div ref={viewport} className={styles.demoScroll} data-demo-viewport>
    <header className={styles.demoHeader}>
      <button className={styles.demoBrand} onClick={() => explore("sea-home")}>NORTH SEA<span>CRAFTED FOR THE OPEN WATER</span></button>
      <button className={styles.demoMenuButton} aria-expanded={menuOpen} aria-controls="sea-navigation" onClick={() => setMenuOpen(!menuOpen)}> {menuOpen ? "Close menu" : "Menu"}<span aria-hidden="true">{menuOpen ? "−" : "+"}</span></button>
      {menuOpen && <nav id="sea-navigation" aria-label="North Sea demo navigation" className={styles.demoMenu}><button onClick={() => explore("sea-home")}>Home</button><button onClick={() => explore("sea-story")}>Our story</button><button onClick={() => explore("sea-models")}>The collection</button><button onClick={() => explore("sea-viewing")}>Your next voyage</button></nav>}
    </header>
    <section id="sea-home" className={styles.marineHero}>
      <Image src="/images/north-sea-yacht.jpg" alt="A white motor yacht carving a gentle wake through deep blue coastal water" fill sizes="(max-width: 760px) 100vw, 1200px" className={styles.marineImage} />
      <div className={styles.heroShade} />
      <div className={styles.marineCopy}><p>BEYOND THE EVERYDAY</p><h2>A different<br />kind of freedom.</h2><p className={styles.marineDescription}>For the places you haven’t been.<br />And the moments you’ll never forget.</p><button className={styles.lightButton} onClick={() => explore("sea-models")}>Explore the collection <span aria-hidden="true">↗</span></button></div>
      <span className={styles.heroNote}>59° N · A LIFE LESS ORDINARY</span>
    </section>
    <section id="sea-story" className={styles.story}><p className={styles.kicker}>THE NORTH SEA PHILOSOPHY</p><h2>Less noise.<br />More horizon.</h2><p>We believe the finest journeys leave room for the unexpected. Considered craftsmanship, timeless lines, and a connection to the water. This is life, a little further out.</p><button onClick={() => explore("sea-models")}>Find your horizon <span aria-hidden="true">↓</span></button></section>
    <section id="sea-models" className={styles.collection}><div className={styles.collectionHeading}><div><p className={styles.kicker}>MADE FOR YOUR NEXT CHAPTER</p><h2>The collection.</h2></div><span>01 — 03</span></div>
      <div className={styles.modelGrid}>{models.map((model, index) => <button className={`${styles.modelCard} ${selected === index ? styles.selectedModel : ""}`} key={model.name} aria-pressed={selected === index} onClick={() => setSelected(index)}>
        <div className={`${styles.modelImage} ${styles[`modelImage${index}`]}`}><Image src="/images/north-sea-yacht.jpg" alt="" fill sizes="(max-width: 620px) 90vw, 380px" /></div><div className={styles.modelText}><span>0{index + 1} / {model.range}</span><h3>{model.name}</h3><p>{model.length} <span>·</span> {model.guests}</p><span className={styles.modelAction}>View model <span aria-hidden="true">↗</span></span></div>
      </button>)}</div>
      <div className={styles.modelDetails} aria-live="polite"><p className={styles.kicker}>A CLOSER LOOK</p><h3>{models[selected].name}</h3><p>{models[selected].description}</p><span>{models[selected].length} / {models[selected].guests}</span></div>
    </section>
    <section id="sea-viewing" className={styles.viewing}><p className={styles.kicker}>THE WATER IS CALLING</p><h2>Your next voyage<br />starts here.</h2><button className={styles.lightButton} onClick={() => setViewing(!viewing)} aria-expanded={viewing}>Request a viewing <span aria-hidden="true">↗</span></button>{viewing && <p className={styles.demoNotice} role="status">You’re exploring a fictional NORTH SEA concept. No request is sent — this is a preview of what we can build.</p>}</section>
    <footer className={styles.demoFooter}><span>NORTH SEA</span><span>A fictional concept by BlueMind · No affiliation with a real boat company.</span></footer>
  </div>;
}
