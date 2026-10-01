"use client";

import Link from "next/link";
import { useState } from "react";
import Planet from "./planet";
import styles from "./home.module.css";

const links = [["/", "Home"], ["/about", "About Us"], ["/services", "Services"], ["/our-work", "Our Work"], ["/how-we-work", "How We Work"], ["/contact", "Contact"]];

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="BlueMind Web Service home"><Planet small /><span>BlueMind<span className={styles.brandSub}>Web Service</span></span></Link>
        <button className={styles.menuToggle} type="button" aria-expanded={expanded} aria-controls="home-navigation" onClick={() => setExpanded(!expanded)}>{expanded ? "Close" : "Menu"}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button>
        <nav id="home-navigation" aria-label="Main navigation" className={`${styles.homeNav} ${expanded ? styles.navExpanded : ""}`}>
          {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setExpanded(false)} aria-current={href === "/" ? "page" : undefined}>{label}</Link>)}
          <Link href="/quote" className={styles.navCta} onClick={() => setExpanded(false)}>Request a Quote <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}
