"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ProjectViewport } from "../portfolio/shared";
import ProjectLoading from "./project-loading";
import styles from "./project-viewer.module.css";

export const deviceModes = [
  { id: "mobile", label: "iPhone", width: 390, height: 844 },
  { id: "ipad", label: "iPad", width: 768, height: 1024 },
  { id: "desktop", label: "Desktop", width: 1440, height: 900 },
] as const;
export type DeviceMode = (typeof deviceModes)[number]["id"];
export type TabletOrientation = "portrait" | "landscape";
type FrameMotion = "settled" | "forward" | "backward";

function deviceIndex(device: DeviceMode) {
  return device === "mobile" ? 0 : device === "ipad" ? 1 : 2;
}

function getInitialDevice(): DeviceMode {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(max-width: 600px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1024px)").matches) return "ipad";
  return "desktop";
}

export default function DevicePreview({
  device,
  orientation,
  initializeDevice,
  children,
}: {
  device: DeviceMode | null;
  orientation: TabletOrientation;
  initializeDevice: Dispatch<SetStateAction<DeviceMode | null>>;
  children: ReactNode;
}) {
  const area = useRef<HTMLDivElement>(null);
  const presentation = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const previousDevice = useRef<DeviceMode | null>(null);
  const motionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [motion, setMotion] = useState<FrameMotion>("settled");
  const [available, setAvailable] = useState({ width: 0, height: 0, touch: false });

  const preset = deviceModes.find((item) => item.id === device) || deviceModes[0];
  const nativeMobile =
    device === "mobile" &&
    (available.width < 480 ||
      (available.touch && available.width < 1000 && available.height < 430));
  const contentWidth = nativeMobile
    ? Math.max(280, available.width - 24)
    : device === "ipad" && orientation === "landscape"
      ? 1024
      : preset.width;
  const contentHeight = nativeMobile
    ? Math.max(540, available.height - 24)
    : device === "ipad" && orientation === "landscape"
      ? 768
      : preset.height;
  const frameWidth = contentWidth;
  const frameHeight = contentHeight;

  useEffect(() => {
    if (!device) return;
    const oldDevice = previousDevice.current;
    if (oldDevice && oldDevice !== device) {
      setMotion(deviceIndex(device) > deviceIndex(oldDevice) ? "forward" : "backward");
      if (motionTimer.current !== null) clearTimeout(motionTimer.current);
      motionTimer.current = setTimeout(() => setMotion("settled"), 360);
    }
    previousDevice.current = device;
  }, [device]);

  useEffect(() => () => {
    if (motionTimer.current !== null) clearTimeout(motionTimer.current);
  }, []);

  useLayoutEffect(() => {
    const host = area.current!;
    const element = frame.current!;
    const box = presentation.current!;
    function fit() {
      const w = element.clientWidth;
      const h = element.clientHeight;
      if (!w || !h || !host.clientWidth || !host.clientHeight) return;
      const scale = Math.min(1, host.clientWidth / w, host.clientHeight / h);
      element.style.transform = `scale(${scale})`;
      element.dataset.scale = String(scale);
      box.style.width = `${w * scale}px`;
      box.style.height = `${h * scale}px`;
    }
    const sizeObserver = new ResizeObserver(() => {
      if (!host.clientWidth || !host.clientHeight) return;
      setAvailable({
        width: host.clientWidth,
        height: host.clientHeight,
        touch: window.matchMedia("(pointer: coarse)").matches,
      });
      if (!initialized.current && host.clientWidth > 0) {
        initialized.current = true;
        initializeDevice(getInitialDevice());
      }
      fit();
    });
    const frameObserver = new ResizeObserver(fit);
    sizeObserver.observe(host);
    frameObserver.observe(element);
    fit();
    return () => {
      sizeObserver.disconnect();
      frameObserver.disconnect();
    };
  }, [initializeDevice, device, frameWidth, frameHeight]);

  useLayoutEffect(() => {
    if (!device || !available.width || !available.height || !frame.current) return;
    frame.current.dataset.ready = "true";
  }, [device, available, frameWidth, frameHeight]);

  return (
    <div className={styles.stage}>
      <div ref={area} className={styles.availableArea}>
        <div ref={presentation} className={styles.presentation} data-motion={motion}>
          <div
            ref={frame}
            className={styles.frameShell}
            data-device-frame={device || "preparing"}
            data-orientation={orientation}
            data-native-mobile={nativeMobile}
            style={{
              width: `${Math.max(1, frameWidth)}px`,
              height: `${Math.max(1, frameHeight)}px`,
              left: 0,
              top: 0,
            }}
          >
            <div
              className={styles.deviceScreen}
              style={{
                width: `${Math.max(1, frameWidth)}px`,
                height: `${Math.max(1, frameHeight)}px`,
              }}
            >
              <div
                className={styles.logicalFrame}
                data-demo-viewport
                data-demo-device={device || "preparing"}
                style={{ width: `${Math.max(1, contentWidth)}px`, height: `${Math.max(1, contentHeight)}px` }}
              >
                <ProjectViewport>
                  {device && available.width ? children : <ProjectLoading />}
                </ProjectViewport>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
