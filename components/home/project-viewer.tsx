"use client";

import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from "react";
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
import { useLocalization } from "../localization-provider";
import WindowIcon from "./window-icon";

const PANEL_DURATION = 480;
type ViewerPhase = "open" | "minimizing" | "minimized" | "closing";
export type ProjectViewerHandle = { restore: () => void };

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
  ref,
}: {
  project: ProjectId;
  onClose: () => void;
  ref: Ref<ProjectViewerHandle>;
}) {
  const { translate } = useLocalization();
  const info = projects.find((item) => item.id === project)!;
  const Project = projectComponents[project];
  const dialog = useRef<HTMLDialogElement>(null);
  const firstControl = useRef<HTMLButtonElement>(null);
  const frames = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<ViewerPhase>("open");
  const revealedRef = useRef(false);
  const releasePage = useRef<(() => void) | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const restoreButton = useRef<HTMLButtonElement>(null);
  const savedScroll = useRef<{ element: HTMLElement; x: number; y: number }[]>(
    [],
  );
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState<ViewerPhase>("open");
  const [expanded, setExpanded] = useState(false);
  const [device, setDevice] = useState<DeviceMode | null>(null);
  const [orientation, setOrientation] = useState<TabletOrientation>("portrait");
  const exiting = phase === "closing" || phase === "minimizing";

  function changePhase(next: ViewerPhase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function cancelPending() {
    frames.current.forEach(cancelAnimationFrame);
    frames.current = [];
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function lockPage() {
    if (releasePage.current) return;
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
    releasePage.current = () => {
      Object.assign(body.style, saved);
      root.style.overflow = rootSaved.overflow;
      root.style.scrollbarGutter = rootSaved.scrollbarGutter;
      root.style.scrollBehavior = "auto";
      window.scrollTo(x, y);
      root.style.scrollBehavior = rootSaved.scrollBehavior;
    };
  }

  function unlockPage() {
    releasePage.current?.();
    releasePage.current = null;
  }

  function show() {
    cancelPending();
    const element = dialog.current!;
    element.removeAttribute("aria-hidden");
    element.inert = false;
    lockPage();
    if (!element.open) element.showModal();
    firstControl.current?.focus({ preventScroll: true });
    element.getBoundingClientRect();
    frames.current.push(
      requestAnimationFrame(() => {
        // Restore logical scroll offsets after the hidden dialog is laid out again.
        savedScroll.current.forEach(({ element, x, y }) =>
          element.scrollTo({ left: x, top: y, behavior: "instant" }),
        );
        frames.current.push(
          requestAnimationFrame(() => {
            if (phaseRef.current !== "open") return;
            revealedRef.current = true;
            setRevealed(true);
          }),
        );
      }),
    );
  }

  useLayoutEffect(() => {
    opener.current = document.activeElement as HTMLElement | null;
    show();
    return () => {
      cancelPending();
      dialog.current?.close();
      unlockPage();
      if (phaseRef.current !== "minimized" && opener.current?.isConnected)
        opener.current.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    if (phase !== "minimized") return;
    const dock = restoreButton.current!;
    dock.focus({ preventScroll: true });
    let frame = 0;
    function place() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Keep the compact restore action clear of visible page controls.
        const width = dock.offsetWidth,
          height = dock.offsetHeight;
        const safe = Math.max(
          16,
          Number.parseFloat(
            getComputedStyle(dock).getPropertyValue("--dock-safe-bottom"),
          ) || 0,
        );
        const obstacles = [
          ...document.querySelectorAll<HTMLElement>(
            "a, button:not([data-project-card]), [data-demo-cta]",
          ),
        ]
          .filter(
            (el) =>
              el !== dock &&
              !el.closest("dialog, [inert]") &&
              getComputedStyle(el).visibility === "visible",
          )
          .map((el) => el.getBoundingClientRect())
          .filter(
            (rect) =>
              rect.width &&
              rect.height &&
              rect.bottom > 0 &&
              rect.top < innerHeight,
          );
        let best = { x: 20, bottom: safe, overlap: Infinity };
        for (
          let bottom = safe;
          bottom < innerHeight - height - 16;
          bottom += 64
        ) {
          for (const x of [20, Math.max(16, innerWidth - width - 20)]) {
            const top = innerHeight - bottom - height;
            const overlap = obstacles.reduce(
              (sum, r) =>
                sum +
                Math.max(
                  0,
                  Math.min(x + width + 6, r.right) - Math.max(x - 6, r.left),
                ) *
                  Math.max(
                    0,
                    Math.min(top + height + 6, r.bottom) -
                      Math.max(top - 6, r.top),
                  ),
              0,
            );
            if (overlap < best.overlap) best = { x, bottom, overlap };
          }
          if (!best.overlap) break;
        }
        Object.assign(dock.style, {
          left: `${best.x}px`,
          right: "auto",
          bottom: `${best.bottom}px`,
        });
      });
    }
    place();
    const observer = new ResizeObserver(place);
    observer.observe(dock);
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [phase]);

  function finishExit() {
    const intent = phaseRef.current;
    if (intent !== "closing" && intent !== "minimizing") return;
    cancelPending();
    if (intent === "closing") {
      onClose();
    } else {
      dialog.current!.close();
      unlockPage();
      changePhase("minimized");
    }
  }

  function exit(intent: "closing" | "minimizing") {
    const current = phaseRef.current;
    if (current === "closing" || current === "minimized") return;
    if (current === "minimizing") {
      if (intent === "closing") changePhase("closing");
      return;
    }
    if (intent === "minimizing") {
      savedScroll.current = [
        ...dialog.current!.querySelectorAll<HTMLElement>("*"),
      ]
        .filter((element) => element.scrollTop > 0 || element.scrollLeft > 0)
        .map((element) => ({
          element,
          x: element.scrollLeft,
          y: element.scrollTop,
        }));
    }
    cancelPending();
    changePhase(intent);
    setRevealed(false);
    if (
      !revealedRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finishExit();
    } else {
      timer.current = setTimeout(finishExit, PANEL_DURATION + 80);
    }
  }

  function close() {
    exit("closing");
  }

  function restore() {
    const current = phaseRef.current;
    if (current !== "minimized" && current !== "minimizing") return;
    changePhase("open");
    revealedRef.current = false;
    show();
  }

  useImperativeHandle(ref, () => ({ restore }));

  return (
    <>
      {phase === "minimized" && (
        <button
          ref={restoreButton}
          className={styles.restoreDock}
          onClick={restore}
          aria-label={`Restore ${info.brand} demo`}
        >
          <strong>{info.brand}</strong>
          <span>Restore</span>
        </button>
      )}
      <dialog
        ref={dialog}
        className={styles.dialog}
        data-revealed={revealed}
        data-closing={phase === "closing"}
        data-viewer-phase={phase}
        inert={phase === "minimized"}
        aria-hidden={phase === "minimized" ? true : undefined}
        data-expanded={expanded}
        aria-labelledby="project-viewer-title"
        aria-describedby="project-viewer-category"
        onTransitionEnd={(e) => {
          if (
            e.target === e.currentTarget &&
            e.propertyName === "transform" &&
            (phaseRef.current === "closing" ||
              phaseRef.current === "minimizing")
          )
            finishExit();
        }}
        onTransitionCancel={(e) => {
          if (
            e.target === e.currentTarget &&
            (phaseRef.current === "closing" ||
              phaseRef.current === "minimizing") &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
          )
            finishExit();
        }}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            close();
            return;
          }
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
            <div className={styles.windowIdentity}>
              <span className={styles.trafficLights} aria-hidden="true">
                <span className={styles.redLight} />
                <span className={styles.yellowLight} />
                <span className={styles.greenLight} />
              </span>
              <div className={styles.projectTitle}>
                <strong id="project-viewer-title">{info.brand}</strong>
                <span id="project-viewer-category">{info.category}</span>
              </div>
            </div>
            <div
              className={styles.windowActions}
              role="group"
              aria-label={translate("Preview window actions")}
              data-no-translate
            >
              <button
                ref={firstControl}
                className={styles.backButton}
                aria-label={translate("Back to Concepts")}
                onClick={close}
              >
                {translate("Back to Concepts")}
              </button>
              <button
                className={styles.expandButton}
                aria-label={
                  expanded ? translate("Restore viewer size") : translate("Expand project viewer")
                }
                aria-pressed={expanded}
                disabled={exiting}
                onClick={() => setExpanded((value) => !value)}
              >
                <WindowIcon action="expand" expanded={expanded} />
                <span>{translate(expanded ? "Restore" : "Expand")}</span>
              </button>
            </div>
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
                  disabled={exiting}
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
    </>
  );
}
