"use client";

import Link from "next/link";
import { Check, ChevronDown, Globe2, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandLockup } from "../brand-lockup";
import { useLocalization, type Locale } from "../localization-provider";
import styles from "./home.module.css";

const links = [["/", "Home"], ["/about", "About Us"], ["/services", "Services"], ["/templates", "Website Concepts"], ["/how-we-work", "How We Work"], ["/care", "Website Care"], ["/contact", "Contact"]];

export default function Navbar({ activePath = "/" }: { activePath?: string }) {
  const { locale, languages, setLocale } = useLocalization();
  const [expanded, setExpanded] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const languageToggleRef = useRef<HTMLButtonElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = languages.find((language) => language.code === locale) ?? languages[0];

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const updateHeight = () => document.documentElement.style.setProperty("--website-header-height", `${header.offsetHeight}px`);
    const updateScroll = () => setScrolled(window.scrollY > 8);
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    updateHeight();
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScroll);
      document.documentElement.style.removeProperty("--website-header-height");
    };
  }, []);

  useEffect(() => {
    setExpanded(false);
    setLanguageOpen(false);
    setScrolled(window.scrollY > 8);
  }, [activePath]);

  useEffect(() => {
    if (!expanded) return;
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setExpanded(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setExpanded(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [expanded]);

  useEffect(() => {
    if (!languageOpen) return;
    languageRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    const closeLanguageMenu = (event: MouseEvent) => {
      if (languageRef.current?.contains(event.target as Node)) return;
      setLanguageOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setLanguageOpen(false);
      languageToggleRef.current?.focus();
    };
    document.addEventListener("mousedown", closeLanguageMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeLanguageMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [languageOpen]);

  return (
    <header ref={headerRef} className={styles.header} data-scrolled={scrolled} onKeyDown={(event) => {
      if (event.key === "Escape" && expanded) {
        setExpanded(false);
        toggleRef.current?.focus();
      }
    }}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="BlueMind Web Service home" onClick={() => { setExpanded(false); setLanguageOpen(false); }}><BrandLockup className={styles.headerBrand} logoClassName={styles.brandLogo} priority solidLogo /></Link>
        {activePath !== "/sign-in" && <div className={styles.headerControls}>
          <Link className={styles.signInLink} href="/sign-in" aria-current={activePath === "/sign-in" ? "page" : undefined} onClick={() => { setExpanded(false); setLanguageOpen(false); }}>Sign in</Link>
          <div className={styles.languageSelector} ref={languageRef} data-no-translate>
            <button ref={languageToggleRef} className={styles.languageButton} type="button" aria-label={`Selected language: ${selectedLanguage.label}`} aria-haspopup="menu" aria-controls="header-languages" aria-expanded={languageOpen} onClick={() => { setLanguageOpen((open) => !open); setExpanded(false); }} onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setLanguageOpen(true); setExpanded(false); }
            }}>
              <Globe2 aria-hidden="true" className={styles.languageIcon} size={19} strokeWidth={1.6} />
              <span className={styles.languageShort}>{selectedLanguage.short}</span>
              <ChevronDown className={styles.languageChevron} aria-hidden="true" size={12} />
            </button>
            <div id="header-languages" className={styles.languageMenu} role="menu" aria-label="Languages" data-open={languageOpen} inert={!languageOpen} onKeyDown={(event) => {
              const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
              const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
              let next: number;
              if (event.key === "ArrowDown") next = (index + 1) % buttons.length;
              else if (event.key === "ArrowUp") next = (index + buttons.length - 1) % buttons.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = buttons.length - 1;
              else return;
              event.preventDefault();
              buttons[next]?.focus();
            }} onBlur={(event) => { if (!languageRef.current?.contains(event.relatedTarget)) setLanguageOpen(false); }}>
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
                    languageToggleRef.current?.focus();
                  }}
                >
                  <span>{language.label}</span>
                  {locale === language.code ? <Check size={15} aria-hidden="true" /> : <small>{language.short}</small>}
                </button>
              ))}
            </div>
          </div>
          <button ref={toggleRef} className={styles.menuToggle} type="button" aria-label={expanded ? "Close menu" : "Open menu"} aria-expanded={expanded} aria-controls="home-navigation" data-expanded={expanded} onClick={() => { setExpanded((open) => !open); setLanguageOpen(false); }}>
            <span className={styles.menuLabel} aria-hidden="true"><span>Menu</span><span>Close</span></span>
            <span className={styles.menuSymbol} aria-hidden="true">
              <Menu className={styles.menuOpenIcon} size={20} />
              <X className={styles.menuCloseIcon} size={20} />
            </span>
          </button>
        </div>}
        {activePath !== "/sign-in" && <div className={`${styles.navPanel} ${expanded ? styles.navExpanded : ""}`}>
          <nav id="home-navigation" aria-label="Main navigation" className={styles.homeNav} inert={!expanded} aria-hidden={!expanded ? true : undefined}>
            {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setExpanded(false)} aria-current={href === activePath ? "page" : undefined}><span className={styles.navLabel}>{label}</span></Link>)}
            <Link href="/quote" className={styles.navCta} onClick={() => setExpanded(false)} aria-current={activePath === "/quote" ? "page" : undefined}>Request a Quote</Link>
          </nav>
        </div>}
      </div>
    </header>
  );
}


