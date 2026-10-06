"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BlueMindPlanetLogo } from "../blue-mind-planet-logo";
import styles from "./home.module.css";

const links = [["/", "Home"], ["/about", "About Us"], ["/services", "Services"], ["/#selected-work", "Website Concepts"], ["/how-we-work", "How We Work"], ["/care", "Website Care"], ["/contact", "Contact"]];

export default function Navbar({ activePath = "/" }: { activePath?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1240px)");
    const updateLayout = () => {
      setCompact(media.matches);
      setExpanded(false);
    };
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setExpanded(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [expanded]);

  return (
    <header className={styles.header} onKeyDown={(event) => {
      if (event.key === "Escape" && expanded) {
        setExpanded(false);
        toggleRef.current?.focus();
      }
    }}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="BlueMind Web Service home"><BlueMindPlanetLogo className={styles.brandLogo} priority /><span>BlueMind<span className={styles.brandSub}>Web Service</span></span></Link>
        <button ref={toggleRef} className={styles.menuToggle} type="button" aria-label={expanded ? "Close menu" : "Open menu"} aria-expanded={expanded} aria-controls="home-navigation" data-expanded={expanded} onClick={() => setExpanded((open) => !open)}>
          <span className={styles.menuLabel} aria-hidden="true"><span>Menu</span><span>Close</span></span>
          <span className={styles.menuSymbol} aria-hidden="true">
            <svg className={styles.menuOpenIcon} viewBox="0 0 16 16" focusable="false">
              <path d="M8 3.25v9.5M3.25 8h9.5" />
            </svg>
            <svg className={styles.menuCloseIcon} viewBox="0 0 16 16" focusable="false">
              <path d="m4.5 4.5 7 7M11.5 4.5l-7 7" />
            </svg>
          </span>
        </button>
        <div className={`${styles.navPanel} ${expanded ? styles.navExpanded : ""}`}>
          <nav id="home-navigation" aria-label="Main navigation" className={styles.homeNav} inert={compact && !expanded} aria-hidden={compact && !expanded ? true : undefined}>
            {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setExpanded(false)} aria-current={href === activePath ? "page" : undefined}><span className={styles.navLabel}>{label}</span></Link>)}
            <Link href="/quote" className={styles.navCta} onClick={() => setExpanded(false)} aria-current={activePath === "/quote" ? "page" : undefined}>Request a Quote</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}


