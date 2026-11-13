"use client";

import Link from "next/link";
import { Check, ChevronDown, Globe2, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandLockup } from "../brand-lockup";
import { useLocalization, type Locale } from "../localization-provider";
import styles from "./home.module.css";
import TextActionLabel from "../text-action-label";

const languageUi = {
  en: { selected: "Selected language: ", languages: "Languages", openMenu: "Open menu", closeMenu: "Close menu", mainNavigation: "Main navigation" },
  sv: { selected: "Valt språk: ", languages: "Språk", openMenu: "Öppna meny", closeMenu: "Stäng meny", mainNavigation: "Huvudnavigation" },
  ar: { selected: "اللغة المختارة: ", languages: "اللغات", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة", mainNavigation: "التنقل الرئيسي" },
} as const;

type NavbarProps = {
  activePath?: string;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
};

export default function Navbar({ activePath = "/", menuOpen = false, onMenuOpenChange = () => {} }: NavbarProps) {
  const { locale, languages, setLocale } = useLocalization();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const languageToggleRef = useRef<HTMLButtonElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = languages.find((language) => language.code === locale) ?? languages[0];
  const languageText = languageUi[locale];
  const textEffects = activePath === "/";

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
    onMenuOpenChange(false);
    setLanguageOpen(false);
    setScrolled(window.scrollY > 8);
  }, [activePath, onMenuOpenChange]);

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
      if (event.key === "Escape" && menuOpen) {
        onMenuOpenChange(false);
        toggleRef.current?.focus();
      }
    }}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="BlueMind Web Service home" onClick={() => { onMenuOpenChange(false); setLanguageOpen(false); }}><BrandLockup className={styles.headerBrand} logoClassName={styles.brandLogo} serviceClassName={styles.mobileService} priority solidLogo /></Link>
        {activePath !== "/sign-in" && activePath !== "/login" && <div className={styles.headerControls}>
          <Link className={styles.signInLink} href="/sign-in" aria-current={activePath === "/sign-in" ? "page" : undefined} onClick={() => { onMenuOpenChange(false); setLanguageOpen(false); }}><TextActionLabel enabled={textEffects} underline={false}>Sign in</TextActionLabel></Link>
          <div className={styles.languageSelector} ref={languageRef} data-no-translate>
            <button ref={languageToggleRef} className={styles.languageButton} type="button" aria-label={`${languageText.selected}${selectedLanguage.nativeName}`} aria-haspopup="menu" aria-controls="header-languages" aria-expanded={languageOpen} onClick={() => { setLanguageOpen((open) => !open); onMenuOpenChange(false); }} onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setLanguageOpen(true); onMenuOpenChange(false); }
            }}>
              <Globe2 aria-hidden="true" className={styles.languageIcon} size={19} strokeWidth={1.6} />
              <span className={styles.languageShort}><TextActionLabel enabled={textEffects} underline={false}>{selectedLanguage.short}</TextActionLabel></span>
              <ChevronDown className={styles.languageChevron} aria-hidden="true" size={12} />
            </button>
            <div id="header-languages" className={styles.languageMenu} role="menu" aria-label={languageText.languages} data-open={languageOpen} inert={!languageOpen} onKeyDown={(event) => {
              const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
              if (!buttons.length) return;
              const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
              let next: number;
              if (event.key === "ArrowDown") next = (index + 1) % buttons.length;
              else if (event.key === "ArrowUp") next = (index + buttons.length - 1) % buttons.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = buttons.length - 1;
              else return;
              event.preventDefault();
              buttons[next]?.focus();
            }}>
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
                  <span><TextActionLabel enabled={textEffects} underline={false}>{language.nativeName}</TextActionLabel></span>
                  {locale === language.code ? <Check size={15} aria-hidden="true" /> : <small>{language.short}</small>}
                </button>
              ))}
            </div>
          </div>
          <button ref={toggleRef} className={styles.menuToggle} type="button" aria-label={menuOpen ? languageText.closeMenu : languageText.openMenu} aria-expanded={menuOpen} aria-controls="site-navigation-panel" data-expanded={menuOpen} onClick={() => { onMenuOpenChange(!menuOpen); setLanguageOpen(false); }}>
            <span className={styles.menuLabel} aria-hidden="true"><span><TextActionLabel enabled={textEffects} underline={false}>Menu</TextActionLabel></span><span><TextActionLabel enabled={textEffects} underline={false}>Close</TextActionLabel></span></span>
            <span className={styles.menuSymbol} aria-hidden="true">
              <Menu className={styles.menuOpenIcon} size={20} />
              <X className={styles.menuCloseIcon} size={20} />
            </span>
          </button>
        </div>}
      </div>
    </header>
  );
}


