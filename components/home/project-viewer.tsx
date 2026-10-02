"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  projects,
  projectComponents,
  type ProjectId,
} from "../portfolio/registry";
import DevicePreview, {
  deviceModes,
  type DeviceMode,
  type TabletOrientation,
} from "./device-preview";
import styles from "./project-viewer.module.css";

const PANEL_DURATION = 480;

function DeviceIcon({ device }: { device: DeviceMode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {device === "desktop" ? (
        <>
          <rect x="3" y="4" width="18" height="13" rx="1.5" />
          <path d="M12 17v4m-4 0h8" />
        </>
      ) : device === "laptop" ? (
        <>
          <rect x="5" y="4" width="14" height="12" rx="1.5" />
          <path d="m5 16-3 4h20l-3-4" />
        </>
      ) : (
        <>
          <rect
            x={device === "ipad" ? 5 : 7}
            y="2"
            width={device === "ipad" ? 14 : 10}
            height="20"
            rx="2"
          />
          <path d="M11 19h2" />
        </>
      )}
    </svg>
  );
}

export default function InteractiveProjectViewer({
  project,
  onClose,
}: {
  project: ProjectId;
  onClose: () => void;
}) {
  const info = projects.find((item) => item.id === project)!;
  const Project = projectComponents[project];
  const dialog = useRef<HTMLDialogElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const frames = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingRef = useRef(false);
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [device, setDevice] = useState<DeviceMode | null>(null);
  const [orientation, setOrientation] = useState<TabletOrientation>("portrait");

  useLayoutEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const x = window.scrollX,
      y = window.scrollY;
    const body = document.body,
      root = document.documentElement;
    const saved = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const rootSaved = {
      overflow: root.style.overflow,
      scrollbarGutter: root.style.scrollbarGutter,
      scrollBehavior: root.style.scrollBehavior,
    };
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    Object.assign(body.style, {
      position: "fixed",
      top: `-${y}px`,
      left: `-${x}px`,
      width: "100%",
      overflow: "hidden",
    });
    element.showModal();
    back.current?.focus({ preventScroll: true });
    element.getBoundingClientRect();
    frames.current.push(
      requestAnimationFrame(() => {
        frames.current.push(
          requestAnimationFrame(() => {
            if (closingRef.current) return;
            revealedRef.current = true;
            setRevealed(true);
          }),
        );
      }),
    );
    return () => {
      frames.current.forEach(cancelAnimationFrame);
      if (timer.current) clearTimeout(timer.current);
      element.close();
      Object.assign(body.style, saved);
      root.style.overflow = rootSaved.overflow;
      root.style.scrollbarGutter = rootSaved.scrollbarGutter;
      root.style.scrollBehavior = "auto";
      window.scrollTo(x, y);
      previousFocus?.focus({ preventScroll: true });
      root.style.scrollBehavior = rootSaved.scrollBehavior;
    };
  }, []);

  function finishClose() {
    if (timer.current) clearTimeout(timer.current);
    onClose();
  }

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    frames.current.forEach(cancelAnimationFrame);
    if (
      !revealedRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finishClose();
      return;
    }
    setClosing(true);
    setRevealed(false);
    // transitionend normally finishes the exit; this handles a cancelled transition.
    timer.current = setTimeout(finishClose, PANEL_DURATION + 80);
  }

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      data-revealed={revealed}
      data-closing={closing}
      data-expanded={expanded}
      aria-labelledby="project-viewer-title"
      aria-describedby="project-viewer-category"
      onTransitionEnd={(e) => {
        if (
          e.target === e.currentTarget &&
          e.propertyName === "transform" &&
          closingRef.current
        )
          finishClose();
      }}
      onTransitionCancel={(e) => {
        if (
          e.target === e.currentTarget &&
          closingRef.current &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          finishClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            "button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex='0']",
          ),
        ].filter(
          (el) => el.getClientRects().length > 0 && !el.closest("[inert]"),
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus({ preventScroll: true });
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus({ preventScroll: true });
        }
      }}
    >
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <div className={styles.windowTitle}>
            <div className={styles.windowControls}>
              <button
                className={styles.trafficButton}
                aria-label="Close project viewer"
                onClick={close}
              >
                <span className={styles.red}>
                  <svg viewBox="0 0 10 10" aria-hidden="true">
                    <path d="m3 3 4 4m0-4-4 4" />
                  </svg>
                </span>
              </button>
              <span className={styles.yellowControl} aria-hidden="true">
                <span className={styles.yellow} />
              </span>
              <button
                className={styles.trafficButton}
                aria-label={
                  expanded ? "Restore viewer size" : "Expand project viewer"
                }
                aria-pressed={expanded}
                onClick={() => setExpanded((value) => !value)}
              >
                <span className={styles.green}>
                  <svg viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M3 6V3h3M7 4v3H4" />
                  </svg>
                </span>
              </button>
            </div>
            <div className={styles.projectTitle}>
              <strong id="project-viewer-title">{info.brand}</strong>
              <span id="project-viewer-category">{info.category}</span>
            </div>
          </div>
          <button ref={back} className={styles.backButton} onClick={close}>
            Back to Projects <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className={styles.deviceBar}>
          <div
            className={styles.deviceControls}
            role="group"
            aria-label="Device preview"
          >
            {deviceModes.map((mode) => (
              <button
                key={mode.id}
                aria-pressed={device === mode.id}
                onClick={() => setDevice(mode.id)}
                disabled={closing}
              >
                <DeviceIcon device={mode.id} />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
          {device === "ipad" && (
            <div
              className={styles.orientationControls}
              role="group"
              aria-label="iPad orientation"
            >
              {(["portrait", "landscape"] as const).map((value) => (
                <button
                  key={value}
                  aria-pressed={orientation === value}
                  onClick={() => setOrientation(value)}
                >
                  {value === "portrait" ? "Portrait" : "Landscape"}
                </button>
              ))}
            </div>
          )}
        </div>
        <DevicePreview
          device={device}
          orientation={orientation}
          initializeDevice={setDevice}
        >
          <Project />
        </DevicePreview>
      </div>
    </dialog>
  );
}
