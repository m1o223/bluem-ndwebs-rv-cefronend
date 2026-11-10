"use client";

import Link from "next/link";
import { Check, ChevronDown, Globe2, Menu, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandLockup } from "../brand-lockup";
import { useLocalization, type Locale } from "../localization-provider";
import styles from "./home.module.css";
import TextActionLabel from "../text-action-label";

const languageUi = {
  en: { search: "Search languages", empty: "No matching languages", selected: "Selected language: ", languages: "Languages", openMenu: "Open menu", closeMenu: "Close menu", mainNavigation: "Main navigation" },
  sv: { search: "Sök språk", empty: "Inga matchande språk", selected: "Valt språk: ", languages: "Språk", openMenu: "Öppna meny", closeMenu: "Stäng meny", mainNavigation: "Huvudnavigation" },
  ar: { search: "ابحث عن لغة", empty: "لا توجد لغات مطابقة", selected: "اللغة المختارة: ", languages: "اللغات", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة", mainNavigation: "التنقل الرئيسي" },
} as const;

const links = [["/", "Home"], ["/about", "About Us"], ["/services", "Services"], ["/templates", "Website Concepts"], ["/how-we-work", "How We Work"], ["/care", "Website Care"], ["/contact", "Contact"]];

export default function Navbar({ activePath = "/" }: { activePath?: string }) {
  const { locale, languages, setLocale } = useLocalization();
  const [expanded, setExpanded] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const languageToggleRef = useRef<HTMLButtonElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = languages.find((language) => language.code === locale) ?? languages[0];
  const visibleLanguages = useMemo(() => {
    const query = languageQuery.trim().toLocaleLowerCase();
    if (!query) return languages;
    return languages.filter((language) => [language.label, language.nativeName, language.short].some((value) => value.toLocaleLowerCase().includes(query)));
  }, [languageQuery, languages]);
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
      <div className={styles.headerInner} data-expanded={expanded}>
        <Link className={styles.brand} href="/" aria-label="BlueMind Web Service home" onClick={() => { setExpanded(false); setLanguageOpen(false); }}><BrandLockup className={styles.headerBrand} logoClassName={styles.brandLogo} serviceClassName={styles.mobileService} priority solidLogo /></Link>
        {activePath !== "/sign-in" && activePath !== "/login" && <div className={styles.headerControls}>
          <Link className={styles.signInLink} href="/sign-in" aria-current={activePath === "/sign-in" ? "page" : undefined} onClick={() => { setExpanded(false); setLanguageOpen(false); }}><TextActionLabel enabled={textEffects} underline={false}>Sign in</TextActionLabel></Link>
          <div className={styles.languageSelector} ref={languageRef} data-no-translate>
            <button ref={languageToggleRef} className={styles.languageButton} type="button" aria-label={`${languageText.selected}${selectedLanguage.nativeName}`} aria-haspopup="menu" aria-controls="header-languages" aria-expanded={languageOpen} onClick={() => { setLanguageOpen((open) => !open); setExpanded(false); }} onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setLanguageOpen(true); setExpanded(false); }
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
            }} onBlur={(event) => { if (!languageRef.current?.contains(event.relatedTarget)) setLanguageOpen(false); }}>
              <label className={styles.languageSearchLabel} htmlFor="language-search">{languageText.search}</label>
              <input
                id="language-search"
                className={styles.languageSearch}
                type="search"
                value={languageQuery}
                placeholder={languageText.search}
                aria-label={languageText.search}
                onChange={(event) => setLanguageQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setLanguageOpen(false);
                    languageToggleRef.current?.focus();
                  }
                }}
              />
              {visibleLanguages.map((language) => (
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
              {!visibleLanguages.length && <p className={styles.languageEmpty}>{languageText.empty}</p>}
            </div>
          </div>
          <button ref={toggleRef} className={styles.menuToggle} type="button" aria-label={expanded ? languageText.closeMenu : languageText.openMenu} aria-expanded={expanded} aria-controls="home-navigation" data-expanded={expanded} onClick={() => { setExpanded((open) => !open); setLanguageOpen(false); }}>
            <span className={styles.menuLabel} aria-hidden="true"><span><TextActionLabel enabled={textEffects} underline={false}>Menu</TextActionLabel></span><span><TextActionLabel enabled={textEffects} underline={false}>Close</TextActionLabel></span></span>
            <span className={styles.menuSymbol} aria-hidden="true">
              <Menu className={styles.menuOpenIcon} size={20} />
              <X className={styles.menuCloseIcon} size={20} />
            </span>
          </button>
        </div>}
        {activePath !== "/sign-in" && activePath !== "/login" && <div className={`${styles.navPanel} ${expanded ? styles.navExpanded : ""}`}>
          <nav id="home-navigation" aria-label={languageText.mainNavigation} className={styles.homeNav} inert={!expanded} aria-hidden={!expanded ? true : undefined}>
            {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setExpanded(false)} aria-current={href === activePath ? "page" : undefined}>{textEffects ? <TextActionLabel underline={false}>{label}</TextActionLabel> : <span className={styles.navLabel}>{label}</span>}</Link>)}
            <Link href="/quote" className={styles.navCta} onClick={() => setExpanded(false)} aria-current={activePath === "/quote" ? "page" : undefined}><TextActionLabel enabled={textEffects} light underline={false}>Request a Quote</TextActionLabel></Link>
          </nav>
        </div>}
      </div>
    </header>
  );
}


