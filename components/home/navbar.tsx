"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Planet from "./planet";
import styles from "./home.module.css";

const links = [["/", "Home"], ["/about", "About Us"], ["/services", "Services"], ["/#selected-work", "Website Concepts"], ["/how-we-work", "How We Work"], ["/contact", "Contact"]];

export default function Navbar({ activePath = "/" }: { activePath?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1120px)");
    const updateLayout = () => {
      setCompact(media.matches);
      setExpanded(false);
    };
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  return (
    <header className={styles.header} onKeyDown={(event) => {
      if (event.key === "Escape" && expanded) {
        setExpanded(false);
        toggleRef.current?.focus();
      }
    }}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="BlueMind Web Service home"><Planet small /><span>BlueMind<span className={styles.brandSub}>Web Service</span></span></Link>
        <button ref={toggleRef} className={styles.menuToggle} type="button" aria-label={expanded ? "Close" : "Menu"} aria-expanded={expanded} aria-controls="home-navigation" data-expanded={expanded} onClick={() => setExpanded((open) => !open)}>
          <span className={styles.menuLabel} aria-hidden="true"><span>Menu</span><span>Close</span></span>
          <span className={styles.menuSymbol} aria-hidden="true"><span>+</span><span>−</span></span>
        </button>
        <div className={`${styles.navPanel} ${expanded ? styles.navExpanded : ""}`}>
          <nav id="home-navigation" aria-label="Main navigation" className={styles.homeNav} inert={compact && !expanded} aria-hidden={compact && !expanded ? true : undefined}>
            {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setExpanded(false)} aria-current={href === activePath ? "page" : undefined}><span className={styles.navLabel}>{label}</span></Link>)}
            <Link href="/quote" className={styles.navCta} onClick={() => setExpanded(false)}>Request a Quote <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
