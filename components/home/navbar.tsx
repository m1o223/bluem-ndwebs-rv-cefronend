"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLockup } from "../brand-lockup";
import { useLocalization, type Locale } from "../localization-provider";
import styles from "./home.module.css";

const links = [["/", "Home"], ["/about", "About Us"], ["/services", "Services"], ["/#selected-work", "Website Concepts"], ["/how-we-work", "How We Work"], ["/care", "Website Care"], ["/contact", "Contact"]];

export default function Navbar({ activePath = "/" }: { activePath?: string }) {
  const { locale, languages, setLocale } = useLocalization();
  const [expanded, setExpanded] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = languages.find((language) => language.code === locale) ?? languages[0];

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

  useEffect(() => {
    if (!languageOpen) return;
    const closeLanguageMenu = (event: MouseEvent) => {
      if (languageRef.current?.contains(event.target as Node)) return;
      setLanguageOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setLanguageOpen(false);
    };
    document.addEventListener("mousedown", closeLanguageMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeLanguageMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [languageOpen]);

  return (
    <header className={styles.header} onKeyDown={(event) => {
      if (event.key === "Escape" && expanded) {
        setExpanded(false);
        toggleRef.current?.focus();
      }
    }}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="BlueMind Web Service home"><BrandLockup logoClassName={styles.brandLogo} priority solidLogo /></Link>
        <div className={styles.headerControls}>
          <div className={styles.languageSelector} ref={languageRef} data-no-translate>
            <button className={styles.languageButton} type="button" aria-label={`Selected language: ${selectedLanguage.label}`} aria-haspopup="menu" aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}>
              <span aria-hidden="true" className={styles.languageIcon}>🌐</span>
              <span>{selectedLanguage.short}</span>
              <span className={styles.languageChevron} aria-hidden="true">▾</span>
            </button>
            <div className={styles.languageMenu} role="menu" data-open={languageOpen}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={locale === language.code}
                  data-selected={locale === language.code}
                  onClick={() => {
                    setLocale(language.code as Locale);
                    setLanguageOpen(false);
                  }}
                >
                  <span>{language.label}</span>
                  <small>{language.short}</small>
                </button>
              ))}
            </div>
          </div>
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
        </div>
        <div className={`${styles.navPanel} ${expanded ? styles.navExpanded : ""}`}>
          <nav id="home-navigation" aria-label="Main navigation" className={styles.homeNav} inert={!expanded} aria-hidden={!expanded ? true : undefined}>
            {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setExpanded(false)} aria-current={href === activePath ? "page" : undefined}><span className={styles.navLabel}>{label}</span></Link>)}
            <Link href="/quote" className={styles.navCta} onClick={() => setExpanded(false)} aria-current={activePath === "/quote" ? "page" : undefined}>Request a Quote</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}


