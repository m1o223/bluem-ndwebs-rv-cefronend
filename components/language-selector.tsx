"use client";

import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useLocalization } from "./localization-provider";

type LanguageSelectorProps = {
  rootClassName: string;
  buttonClassName: string;
  menuClassName: string;
  resetKey?: string;
};

const labels = {
  en: { selected: "Selected language", menu: "Languages" },
  sv: { selected: "Valt språk", menu: "Språk" },
  ar: { selected: "اللغة المختارة", menu: "اللغات" },
} as const;

export default function LanguageSelector({ rootClassName, buttonClassName, menuClassName, resetKey }: LanguageSelectorProps) {
  const { locale, languages, setLocale } = useLocalization();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const selected = languages.find(language => language.code === locale) ?? languages[0]!;
  const copy = labels[locale];

  useEffect(() => {
    setOpen(false);
  }, [resetKey]);

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function moveFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    let next: number | null = null;
    if (event.key === "ArrowDown") next = (index + 1) % options.length;
    if (event.key === "ArrowUp") next = (index + options.length - 1) % options.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = options.length - 1;
    if (next === null) return;
    event.preventDefault();
    options[next]?.focus();
  }

  return <div ref={root} className={rootClassName}>
    <button ref={button} type="button" className={buttonClassName} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} aria-label={`${copy.selected}: ${selected.nativeName}`} onClick={() => setOpen(value => !value)} onKeyDown={event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setOpen(true);
      }
    }}>
      <Globe2 aria-hidden="true" size={18} strokeWidth={1.7} />
      <span>{selected.short}</span>
      <ChevronDown aria-hidden="true" size={12} />
    </button>
    <div id={menuId} className={menuClassName} role="menu" aria-label={copy.menu} data-open={open} inert={!open} onKeyDown={moveFocus}>
      {languages.map(language => <button key={language.code} type="button" role="menuitemradio" aria-checked={locale === language.code} data-selected={locale === language.code} tabIndex={open ? 0 : -1} onClick={() => {
        setLocale(language.code);
        setOpen(false);
        button.current?.focus();
      }}>
        <span>{language.nativeName}</span>
        {locale === language.code ? <Check size={15} aria-hidden="true" /> : <small>{language.short}</small>}
      </button>)}
    </div>
  </div>;
}
