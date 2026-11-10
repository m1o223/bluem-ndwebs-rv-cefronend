"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import CodePreviewWindow from "./code-preview-window";
import WebsitePreviewWindow from "./website-preview-window";
import MiniFeatureCard from "./mini-feature-card";
import styles from "./hero.module.css";

type BoardId = "code" | "design";
type RopeSide = "left" | "right";
type BoardPhase = "anchored" | "swinging" | "falling" | "settled" | "retrieving" | "attached" | "returning";
type CutPoint = { x: number; y: number };

type BoardMotion = {
  phase: BoardPhase;
  leftConnected: boolean;
  rightConnected: boolean;
  pivot: RopeSide | null;
  angle: number;
  angularVelocity: number;
  y: number;
  velocityY: number;
  fallDistance: number;
  ropeProgress: number;
  returnStartedAt: number | null;
  cutPoints: Partial<Record<RopeSide, CutPoint>>;
  cutOffsets: Partial<Record<RopeSide, CutPoint>>;
  cutAngles: Partial<Record<RopeSide, number>>;
  cutRecoil: Partial<Record<RopeSide, number>>;
};

type BoardSnapshot = Pick<BoardMotion, "phase" | "leftConnected" | "rightConnected">;

const BOARD_IDS: BoardId[] = ["code", "design"];
const ROPE_SIDES: RopeSide[] = ["left", "right"];
const ROPE_TOP_OFFSET = 122;
const ROPE_PANEL_INSET = 8;
const RETURN_WAIT_MS = 280;
const RESET_WAIT_MS = 2400;

const initialMotion = (): BoardMotion => ({
  phase: "anchored",
  leftConnected: true,
  rightConnected: true,
  pivot: null,
  angle: 0,
  angularVelocity: 0,
  y: 0,
  velocityY: 0,
  fallDistance: 0,
  ropeProgress: 1,
  returnStartedAt: null,
  cutPoints: {},
  cutOffsets: {},
  cutAngles: {},
  cutRecoil: {},
});

const initialSnapshots = (): Record<BoardId, BoardSnapshot> => ({
  code: { phase: "anchored", leftConnected: true, rightConnected: true },
  design: { phase: "anchored", leftConnected: true, rightConnected: true },
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const easeOutCubic = (amount: number) => 1 - (1 - amount) ** 3;
const rotatePoint = (point: CutPoint, angle: number): CutPoint => ({
  x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
  y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
});
const projectPointToSegment = (point: CutPoint, start: CutPoint, end: CutPoint): CutPoint => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy || 1;
  const amount = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0.12, 0.88);
  return { x: lerp(start.x, end.x, amount), y: lerp(start.y, end.y, amount) };
};

export default function HeroVisual() {
  const visualRef = useRef<HTMLElement | null>(null);
  const ropeSvgRef = useRef<SVGSVGElement | null>(null);
  const boardRefs = useRef<Record<BoardId, HTMLDivElement | null>>({ code: null, design: null });
  const motionsRef = useRef<Record<BoardId, BoardMotion>>({ code: initialMotion(), design: initialMotion() });
  const timersRef = useRef<Record<BoardId, number | null>>({ code: null, design: null });
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const frameRef = useRef<((time: number) => void) | null>(null);
  const canvasSizeRef = useRef({ width: 1, height: 1 });
  const [boardSnapshots, setBoardSnapshots] = useState(initialSnapshots);
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });

  const setSnapshot = useCallback((boardId: BoardId) => {
    const motion = motionsRef.current[boardId];
    const snapshot: BoardSnapshot = {
      phase: motion.phase,
      leftConnected: motion.leftConnected,
      rightConnected: motion.rightConnected,
    };
    if (mountedRef.current) setBoardSnapshots((current) => ({ ...current, [boardId]: snapshot }));
  }, []);

  const getBoardElement = useCallback((boardId: BoardId) => boardRefs.current[boardId], []);

  const getPanelElement = useCallback((boardId: BoardId) => {
    const board = getBoardElement(boardId);
    return board?.querySelector<HTMLElement>(boardId === "code" ? "[data-code-preview]" : "[data-website-preview]") ?? null;
  }, [getBoardElement]);

  const getRopePoints = useCallback((boardId: BoardId, side: RopeSide) => {
    const visual = visualRef.current;
    const panel = getPanelElement(boardId);
    if (!visual || !panel) return null;
    const visualRect = visual.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const end = {
      x: (side === "left" ? panelRect.left + ROPE_PANEL_INSET : panelRect.right - ROPE_PANEL_INSET) - visualRect.left,
      y: panelRect.top - visualRect.top + ROPE_TOP_OFFSET + ROPE_PANEL_INSET,
    };
    return { anchor: { x: clamp(end.x, 8, Math.max(8, visualRect.width - 8)), y: 5 }, end };
  }, [getPanelElement]);

  const getPointerCanvasPoint = useCallback((event: ReactPointerEvent<SVGPathElement>) => {
    const svg = ropeSvgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const getPageBottomDistance = useCallback((boardId: BoardId) => {
    const panel = getPanelElement(boardId);
    if (!panel) return 420;
    const panelRect = panel.getBoundingClientRect();
    const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const currentTop = panelRect.top + window.scrollY;
    const targetTop = Math.max(currentTop + 180, pageHeight - panelRect.height - 30);
    return Math.max(260, targetTop - currentTop);
  }, [getPanelElement]);

  const setPath = useCallback((selector: string, path: string) => {
    const element = ropeSvgRef.current?.querySelector<SVGPathElement>(selector);
    if (element) element.setAttribute("d", path);
  }, []);

  const setCircle = useCallback((selector: string, point: CutPoint | null) => {
    const element = ropeSvgRef.current?.querySelector<SVGCircleElement>(selector);
    if (!element) return;
    if (!point) {
      element.setAttribute("opacity", "0");
      return;
    }
    element.setAttribute("cx", String(point.x));
    element.setAttribute("cy", String(point.y));
    element.setAttribute("opacity", "1");
  }, []);

  const setRopePoint = useCallback((selector: string, point: CutPoint | null) => {
    const element = ropeSvgRef.current?.querySelector<SVGGElement>(selector);
    if (!element) return;
    if (!point) {
      element.setAttribute("opacity", "0");
      return;
    }
    element.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
    element.setAttribute("opacity", "1");
  }, []);

  const ropePath = useCallback((start: CutPoint, end: CutPoint, bend = 0) => {
    const distance = Math.max(30, end.y - start.y);
    const controlOne = { x: start.x + bend, y: start.y + distance * 0.34 };
    const controlTwo = { x: end.x + bend, y: end.y - distance * 0.26 };
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} C ${controlOne.x.toFixed(2)} ${controlOne.y.toFixed(2)}, ${controlTwo.x.toFixed(2)} ${controlTwo.y.toFixed(2)}, ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }, []);

  const writeRopeLayer = useCallback((boardId: BoardId, side: RopeSide, layer: string, path: string) => {
    setPath(`[data-rope-path="${boardId}-${side}-${layer}"]`, path);
  }, [setPath]);

  const updateRopePaths = useCallback(() => {
    const visual = visualRef.current;
    const svg = ropeSvgRef.current;
    if (!visual || !svg) return;

    const visualRect = visual.getBoundingClientRect();
    const width = Math.max(1, visualRect.width);
    const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const canvasHeight = Math.max(visualRect.height + ROPE_TOP_OFFSET, pageHeight - (visualRect.top + window.scrollY) + ROPE_TOP_OFFSET);
    if (Math.abs(canvasSizeRef.current.width - width) > 1 || Math.abs(canvasSizeRef.current.height - canvasHeight) > 1) {
      canvasSizeRef.current = { width, height: canvasHeight };
      if (mountedRef.current) setCanvasSize({ width, height: canvasHeight });
    }
    svg.setAttribute("viewBox", `0 0 ${width} ${canvasHeight}`);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(canvasHeight));
    svg.style.height = `${canvasHeight}px`;

    BOARD_IDS.forEach((boardId) => {
      const motion = motionsRef.current[boardId];

      ROPE_SIDES.forEach((side) => {
        const points = getRopePoints(boardId, side);
        if (!points) return;
        const { anchor, end } = points;
        const isConnected = side === "left" ? motion.leftConnected : motion.rightConnected;
        const cutPoint = motion.cutPoints[side] ?? null;
        const anchorSelector = `[data-rope-anchor="${boardId}-${side}"]`;
        setRopePoint(anchorSelector, end);

        if (motion.phase === "retrieving") {
          const progressEnd = { x: lerp(anchor.x, end.x, motion.ropeProgress), y: lerp(anchor.y, end.y, motion.ropeProgress) };
          const path = ropePath(anchor, progressEnd);
          ["shadow-upper", "base-upper", "fiber-upper", "twist-upper"].forEach((layer) => writeRopeLayer(boardId, side, layer, path));
          ["shadow-lower", "base-lower", "fiber-lower", "twist-lower", "hit"].forEach((layer) => writeRopeLayer(boardId, side, layer, ""));
          setCircle(`[data-rope-cut="${boardId}-${side}"]`, null);
          setRopePoint(`[data-rope-fray-upper="${boardId}-${side}"]`, null);
          setRopePoint(`[data-rope-fray-lower="${boardId}-${side}"]`, null);
          setRopePoint(`[data-rope-hook="${boardId}-${side}"]`, progressEnd);
          return;
        }
        setRopePoint(`[data-rope-hook="${boardId}-${side}"]`, null);

        if (isConnected || motion.phase === "attached" || motion.phase === "returning") {
          const path = ropePath(anchor, end);
          ["shadow-upper", "base-upper", "fiber-upper", "twist-upper"].forEach((layer) => writeRopeLayer(boardId, side, layer, path));
          ["shadow-lower", "base-lower", "fiber-lower", "twist-lower"].forEach((layer) => writeRopeLayer(boardId, side, layer, ""));
          writeRopeLayer(boardId, side, "hit", motion.phase === "anchored" || motion.phase === "swinging" ? path : "");
          setCircle(`[data-rope-cut="${boardId}-${side}"]`, null);
          setRopePoint(`[data-rope-fray-upper="${boardId}-${side}"]`, null);
          setRopePoint(`[data-rope-fray-lower="${boardId}-${side}"]`, null);
          return;
        }

        const cut = cutPoint ?? { x: end.x, y: Math.max(anchor.y + 26, end.y * 0.6) };
        const recoil = motion.cutRecoil[side] ?? 0;
        const upperCut = { x: cut.x + (side === "left" ? -recoil * 0.35 : recoil * 0.35), y: cut.y - recoil };
        const cutOffset = motion.cutOffsets[side];
        const cutAngle = motion.cutAngles[side] ?? motion.angle;
        const lowerOffset = cutOffset ? rotatePoint(cutOffset, motion.angle - cutAngle) : { x: 0, y: -24 };
        const lowerStart = { x: end.x + lowerOffset.x, y: end.y + lowerOffset.y };
        const upperPath = ropePath(anchor, upperCut, side === "left" ? 2 : -2);
        const lowerPath = ropePath(lowerStart, end, side === "left" ? -2 : 2);
        ["shadow-upper", "base-upper", "fiber-upper", "twist-upper"].forEach((layer) => writeRopeLayer(boardId, side, layer, upperPath));
        ["shadow-lower", "base-lower", "fiber-lower", "twist-lower"].forEach((layer) => writeRopeLayer(boardId, side, layer, lowerPath));
        writeRopeLayer(boardId, side, "hit", "");
        setCircle(`[data-rope-cut="${boardId}-${side}"]`, upperCut);
        setRopePoint(`[data-rope-fray-upper="${boardId}-${side}"]`, upperCut);
        setRopePoint(`[data-rope-fray-lower="${boardId}-${side}"]`, lowerStart);
      });
    });
  }, [getRopePoints, ropePath, setCircle, setRopePoint, writeRopeLayer]);

  const applyBoardTransform = useCallback((boardId: BoardId) => {
    const board = getBoardElement(boardId);
    const motion = motionsRef.current[boardId];
    if (!board) return;
    board.style.transformOrigin = motion.pivot === "right" ? "100% 0" : "0 0";
    board.style.transform = `translate3d(0, ${motion.y.toFixed(2)}px, 0) rotate(${motion.angle.toFixed(5)}rad)`;
  }, [getBoardElement]);

  const scheduleBoardReset = useCallback((boardId: BoardId) => {
    if (timersRef.current[boardId] !== null) window.clearTimeout(timersRef.current[boardId] as number);
    timersRef.current[boardId] = window.setTimeout(() => {
      const motion = motionsRef.current[boardId];
      if (motion.phase !== "settled") return;
      motion.phase = "retrieving";
      motion.ropeProgress = 0;
      motion.returnStartedAt = null;
      setSnapshot(boardId);
      updateRopePaths();
      if (animationFrameRef.current === null) {
        lastFrameRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame((time) => frameRef.current?.(time));
      }
    }, reducedMotionRef.current ? 550 : RESET_WAIT_MS);
  }, [setSnapshot, updateRopePaths]);

  const beginReturn = useCallback((boardId: BoardId) => {
    const motion = motionsRef.current[boardId];
    if (motion.phase !== "attached") return;
    motion.phase = "returning";
    motion.returnStartedAt = performance.now();
    setSnapshot(boardId);
    if (animationFrameRef.current === null) {
      lastFrameRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame((time) => frameRef.current?.(time));
    }
  }, [setSnapshot]);

  const frame = useCallback((time: number) => {
    const previous = lastFrameRef.current ?? time;
    const delta = Math.min(0.032, Math.max(0.001, (time - previous) / 1000));
    lastFrameRef.current = time;
    let active = false;

    BOARD_IDS.forEach((boardId) => {
      const motion = motionsRef.current[boardId];
      ROPE_SIDES.forEach((side) => {
        const isConnected = side === "left" ? motion.leftConnected : motion.rightConnected;
        if (!isConnected && (motion.phase === "swinging" || motion.phase === "falling")) {
          const recoil = motion.cutRecoil[side] ?? 0;
          if (recoil < 7) motion.cutRecoil[side] = Math.min(7, recoil + delta * 34);
        }
      });
      if (motion.phase === "swinging") {
        const target = motion.pivot === "right" ? -0.19 : 0.19;
        const stiffness = reducedMotionRef.current ? 24 : 16;
        const damping = reducedMotionRef.current ? 9 : 5.4;
        motion.angularVelocity += ((target - motion.angle) * stiffness - motion.angularVelocity * damping) * delta;
        motion.angle += motion.angularVelocity * delta;
        if (Math.abs(target - motion.angle) < 0.002 && Math.abs(motion.angularVelocity) < 0.004) {
          motion.angle = target;
          motion.angularVelocity = 0;
        } else {
          active = true;
        }
      } else if (motion.phase === "falling") {
        const gravity = reducedMotionRef.current ? 1700 : 2400;
        motion.velocityY += gravity * delta;
        motion.y += motion.velocityY * delta;
        motion.angle += motion.angularVelocity * delta;
        motion.angularVelocity *= reducedMotionRef.current ? 0.985 : 0.998;
        if (motion.y >= motion.fallDistance) {
          motion.y = motion.fallDistance;
          motion.velocityY = 0;
          motion.angularVelocity *= 0.25;
          motion.phase = "settled";
          setSnapshot(boardId);
          scheduleBoardReset(boardId);
        } else {
          active = true;
        }
      } else if (motion.phase === "retrieving") {
        const duration = reducedMotionRef.current ? 0.45 : 1.65;
        motion.ropeProgress = clamp(motion.ropeProgress + delta / duration, 0, 1);
        if (motion.ropeProgress >= 1) {
          motion.ropeProgress = 1;
          motion.phase = "attached";
          setSnapshot(boardId);
          if (timersRef.current[boardId] !== null) window.clearTimeout(timersRef.current[boardId] as number);
          timersRef.current[boardId] = window.setTimeout(() => beginReturn(boardId), reducedMotionRef.current ? 80 : RETURN_WAIT_MS);
        } else {
          active = true;
        }
      } else if (motion.phase === "returning") {
        const duration = reducedMotionRef.current ? 0.75 : 1.95;
        const started = motion.returnStartedAt ?? time;
        const progress = clamp((time - started) / (duration * 1000), 0, 1);
        const eased = easeOutCubic(progress);
        motion.y = motion.fallDistance * (1 - eased);
        motion.angle *= 1 - eased;
        if (progress >= 1) {
          motion.y = 0;
          motion.angle = 0;
          motion.angularVelocity = 0;
          motion.velocityY = 0;
          motion.pivot = null;
          motion.phase = "anchored";
          motion.leftConnected = true;
          motion.rightConnected = true;
          motion.cutPoints = {};
          motion.cutOffsets = {};
          motion.cutAngles = {};
          motion.cutRecoil = {};
          motion.ropeProgress = 1;
          setSnapshot(boardId);
        } else {
          active = true;
        }
      }
      applyBoardTransform(boardId);
    });

    updateRopePaths();
    if (active) {
      animationFrameRef.current = requestAnimationFrame((nextTime) => frameRef.current?.(nextTime));
    } else {
      animationFrameRef.current = null;
      lastFrameRef.current = null;
    }
  }, [applyBoardTransform, beginReturn, scheduleBoardReset, setSnapshot, updateRopePaths]);

  frameRef.current = frame;

  const ensureAnimationFrame = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    lastFrameRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame((time) => frameRef.current?.(time));
  }, []);

  const cutRope = useCallback((boardId: BoardId, side: RopeSide, event?: ReactPointerEvent<SVGPathElement>) => {
    const motion = motionsRef.current[boardId];
    if (["falling", "settled", "retrieving", "attached", "returning"].includes(motion.phase)) return;
    const isConnected = side === "left" ? motion.leftConnected : motion.rightConnected;
    if (!isConnected) return;

    const points = getRopePoints(boardId, side);
    if (!points) return;
    const pointerPoint = event ? getPointerCanvasPoint(event) : null;
    const cutPoint = projectPointToSegment(pointerPoint ?? points.end, points.anchor, points.end);
    motion.cutPoints = { ...motion.cutPoints, [side]: cutPoint };
    motion.cutOffsets = { ...motion.cutOffsets, [side]: { x: cutPoint.x - points.end.x, y: cutPoint.y - points.end.y } };
    motion.cutAngles = { ...motion.cutAngles, [side]: motion.angle };
    motion.cutRecoil = { ...motion.cutRecoil, [side]: 0 };
    if (side === "left") motion.leftConnected = false;
    else motion.rightConnected = false;

    const remainingSide: RopeSide | null = motion.leftConnected ? "left" : motion.rightConnected ? "right" : null;
    if (remainingSide) {
      motion.phase = "swinging";
      motion.pivot = remainingSide;
      motion.angularVelocity = remainingSide === "right" ? -0.16 : 0.16;
    } else {
      motion.phase = "falling";
      motion.pivot = motion.pivot ?? (side === "left" ? "right" : "left");
      motion.velocityY = reducedMotionRef.current ? 620 : 140;
      motion.angularVelocity += motion.pivot === "right" ? -0.18 : 0.18;
      motion.fallDistance = getPageBottomDistance(boardId);
    }
    setSnapshot(boardId);
    updateRopePaths();
    ensureAnimationFrame();
  }, [ensureAnimationFrame, getPageBottomDistance, getPointerCanvasPoint, getRopePoints, setSnapshot, updateRopePaths]);

  const onRopeKeyDown = useCallback((event: ReactKeyboardEvent<SVGPathElement>, boardId: BoardId, side: RopeSide) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    cutRope(boardId, side);
  }, [cutRope]);

  useLayoutEffect(() => {
    mountedRef.current = true;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const updateLayout = () => {
      BOARD_IDS.forEach((boardId) => applyBoardTransform(boardId));
      updateRopePaths();
    };
    updateLayout();
    window.addEventListener("resize", updateLayout, { passive: true });
    window.addEventListener("scroll", updateRopePaths, { passive: true });

    const resizeObserver = typeof ResizeObserver !== "undefined" && visualRef.current
      ? new ResizeObserver(updateLayout)
      : null;
    if (resizeObserver && visualRef.current) resizeObserver.observe(visualRef.current);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("scroll", updateRopePaths);
      resizeObserver?.disconnect();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      Object.values(timersRef.current).forEach((timer) => {
        if (timer !== null) window.clearTimeout(timer);
      });
    };
  }, [applyBoardTransform, updateRopePaths]);

  const renderRope = (boardId: BoardId, side: RopeSide) => (
    <g key={`${boardId}-${side}`} aria-label={`${boardId === "code" ? "Code panel" : "Design panel"} ${side} rope`}>
      {["shadow", "base", "fiber", "twist"].map((styleName) => {
        const className = styles[styleName === "shadow" ? "ropeShadow" : styleName === "base" ? "ropeBase" : styleName === "fiber" ? "ropeFiber" : "ropeTwist"];
        return (
          <g key={styleName}>
            <path className={className} data-rope-path={`${boardId}-${side}-${styleName}-upper`} fill="none" />
            <path className={className} data-rope-path={`${boardId}-${side}-${styleName}-lower`} fill="none" />
          </g>
        );
      })}
      <g className={styles.ropeFray} data-rope-fray-upper={`${boardId}-${side}`} opacity="0" aria-hidden="true">
        <path d="M -2 -1 L -8 -6" />
        <path d="M 0 -1 L 2 -8" />
        <path d="M 2 1 L 8 -4" />
        <path d="M -2 2 L -7 6" />
      </g>
      <g className={styles.ropeFray} data-rope-fray-lower={`${boardId}-${side}`} opacity="0" aria-hidden="true">
        <path d="M -2 -1 L -8 -6" />
        <path d="M 0 -1 L 2 -8" />
        <path d="M 2 1 L 8 -4" />
        <path d="M -2 2 L -7 6" />
      </g>
      <g className={styles.ropeAnchor} data-rope-anchor={`${boardId}-${side}`} opacity="0" aria-hidden="true">
        <circle className={styles.ropeAnchorShadow} cx="0" cy="2" r="8" />
        <circle className={styles.ropeAnchorRing} cx="0" cy="0" r="6" />
        <circle className={styles.ropeAnchorCore} cx="0" cy="0" r="2.4" />
      </g>
      <g className={styles.ropeHook} data-rope-hook={`${boardId}-${side}`} opacity="0" aria-hidden="true">
        <circle cx="0" cy="0" r="4.2" />
        <path d="M 0 4 L 0 10" />
      </g>
      <circle className={styles.ropeCutMarker} data-rope-cut={`${boardId}-${side}`} r="4" opacity="0" />
      <path
        className={styles.ropeHit}
        data-rope-path={`${boardId}-${side}-hit`}
        fill="none"
        tabIndex={0}
        role="button"
        focusable="true"
        aria-label={`Cut ${side} rope on ${boardId === "code" ? "the code panel" : "the design panel"}`}
        onPointerDown={(event) => cutRope(boardId, side, event)}
        onKeyDown={(event) => onRopeKeyDown(event, boardId, side)}
      />
    </g>
  );

  return (
    <figure
      ref={visualRef}
      className={styles.visual}
      role="img"
      aria-label="Website design and development: a polished website layered in front of its React and TypeScript code, with small design and performance panels."
      data-hero-visual
      data-hanging-scene
    >
      <div className={styles.windows} aria-hidden="true">
        <div
          ref={(element) => { boardRefs.current.code = element; }}
          className={`${styles.boardMover} ${styles.codeMover}`}
          data-board="code"
          data-board-phase={boardSnapshots.code.phase}
          data-rope-left={boardSnapshots.code.leftConnected}
          data-rope-right={boardSnapshots.code.rightConnected}
        >
          <CodePreviewWindow />
        </div>
        <div
          ref={(element) => { boardRefs.current.design = element; }}
          className={`${styles.boardMover} ${styles.designMover}`}
          data-board="design"
          data-board-phase={boardSnapshots.design.phase}
          data-rope-left={boardSnapshots.design.leftConnected}
          data-rope-right={boardSnapshots.design.rightConnected}
        >
          <WebsitePreviewWindow />
        </div>
        <MiniFeatureCard variant="design" />
        <MiniFeatureCard variant="performance" />
        <p className={styles.visualCaption}><span /> DESIGN + DEVELOPMENT, TOGETHER.</p>
      </div>

      <svg
        ref={ropeSvgRef}
        className={styles.ropesCanvas}
        aria-label="Interactive hanging ropes"
        role="group"
        preserveAspectRatio="none"
        style={{ width: canvasSize.width > 1 ? `${canvasSize.width}px` : undefined, height: canvasSize.height > 1 ? `${canvasSize.height}px` : undefined }}
      >
        <defs>
          <linearGradient id="ropeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#987b53" />
            <stop offset="0.25" stopColor="#e0c28d" />
            <stop offset="0.52" stopColor="#b28a58" />
            <stop offset="0.76" stopColor="#e4c999" />
            <stop offset="1" stopColor="#8d704a" />
          </linearGradient>
        </defs>
        {BOARD_IDS.flatMap((boardId) => ROPE_SIDES.map((side) => renderRope(boardId, side)))}
      </svg>
    </figure>
  );
}
