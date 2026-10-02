"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import styles from "./shared.module.css";

export function ProjectViewport({ children }: { children: ReactNode }) {
  return (
    <div className={styles.viewport} data-preview-container>
      <div className={styles.scrollViewport} data-project-viewport>
        {children}
      </div>
    </div>
  );
}

export function scrollToSection(control: HTMLElement, section: string) {
  const viewport = control.closest<HTMLElement>("[data-project-viewport]");
  const target = viewport?.querySelector<HTMLElement>(
    `[data-section="${section}"]`,
  );
  if (!viewport || !target) return;
  // Bounding boxes are visual pixels; scrolling uses logical layout pixels.
  const scale =
    viewport.getBoundingClientRect().width / viewport.offsetWidth || 1;
  const headerHeight =
    (viewport.querySelector("header")?.getBoundingClientRect().height ||
      80 * scale) / scale;
  viewport.scrollTo({
    top:
      (target.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top) /
        scale +
      viewport.scrollTop -
      headerHeight -
      8,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

export function ProjectNav({
  brand,
  tagline,
  links,
  action,
  onAction,
}: {
  brand: string;
  tagline?: string;
  links: [string, string][];
  action?: string;
  onAction?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header
      className={styles.nav}
      onKeyDown={(e) => {
        if (open && e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          toggle.current?.focus({ preventScroll: true });
        }
      }}
    >
      <button
        className={styles.brand}
        onClick={(e) => scrollToSection(e.currentTarget, "home")}
      >
        {brand}
        {tagline && <small>{tagline}</small>}
      </button>
      <nav aria-label={`${brand} navigation`} className={styles.desktopLinks}>
        {links.map(([label, id]) => (
          <button
            key={id}
            onClick={(e) => scrollToSection(e.currentTarget, id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className={styles.navActions}>
        {action && (
          <button className={styles.navAction} onClick={onAction}>
            {action}
          </button>
        )}
        <button
          ref={toggle}
          className={styles.menuButton}
          aria-expanded={open}
          aria-label={`${open ? "Close" : "Open"} ${brand} menu`}
          onClick={(e) => {
            e.currentTarget.focus({ preventScroll: true });
            setOpen((value) => !value);
          }}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav
          className={styles.mobileMenu}
          aria-label={`${brand} mobile navigation`}
        >
          {links.map(([label, id]) => (
            <button
              key={id}
              onClick={(e) => {
                scrollToSection(e.currentTarget, id);
                setOpen(false);
                toggle.current?.focus({ preventScroll: true });
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Photo({
  name,
  alt,
  className = "",
  sizes = "(max-width: 700px) 600px, 1600px",
  priority = false,
}: {
  name: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`${styles.photo} ${className}`}>
      <Image
        src={`/images/portfolio/${name}.webp`}
        alt={alt}
        fill
        sizes={sizes}
        quality={90}
        preload={priority}
      />
    </div>
  );
}

export function ModalPanel({
  title,
  children,
  onClose,
  wide = false,
  onKeyDown,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const content = panel.current
      ?.closest("[data-project]")
      ?.querySelector<HTMLElement>("[data-project-content]");
    const viewport = panel.current?.closest<HTMLElement>(
      "[data-project-viewport]",
    );
    const overflow = viewport?.style.overflow;
    if (viewport) viewport.style.overflow = "hidden";
    if (content) content.inert = true;
    close.current?.focus({ preventScroll: true });
    return () => {
      if (viewport) viewport.style.overflow = overflow || "";
      if (content) content.inert = false;
      previous?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (panel.current && !panel.current.contains(document.activeElement))
      close.current?.focus({ preventScroll: true });
  });
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
        if (e.key !== "Tab") return;
        e.stopPropagation();
        const controls = Array.from(
          panel.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex='0']",
          ) || [],
        ).filter((el) => el.getClientRects().length > 0);
        const first = controls[0],
          last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={onKeyDown}
        className={`${styles.panel} ${wide ? styles.widePanel : ""}`}
      >
        <div className={styles.panelHeading}>
          <h2>{title}</h2>
          <button ref={close} aria-label={`Close ${title}`} onClick={onClose}>
            Close <span aria-hidden="true">×</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function DemoFooter({
  brand,
  children,
}: {
  brand: string;
  children?: ReactNode;
}) {
  return (
    <footer className={styles.footer}>
      <strong>{brand}</strong>
      {children}
      <small>
        A fictional BlueMind concept. Orders and enquiries are simulated.
      </small>
    </footer>
  );
}

export function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
