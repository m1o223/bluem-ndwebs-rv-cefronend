"use client";

import {
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
  { id: "desktop", label: "Desktop", width: 1440, height: 900 },
  { id: "laptop", label: "Laptop", width: 1200, height: 800 },
  { id: "ipad", label: "iPad", width: 768, height: 1024 },
  { id: "mobile", label: "Mobile", width: 390, height: 844 },
] as const;
export type DeviceMode = (typeof deviceModes)[number]["id"];
export type TabletOrientation = "portrait" | "landscape";

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
  const fitted = useRef(false);
  const [available, setAvailable] = useState({
    width: 0,
    height: 0,
    touch: false,
  });
  const preset =
    deviceModes.find((item) => item.id === device) || deviceModes[0];
  const nativeMobile =
    device === "mobile" &&
    (available.width < 480 ||
      (available.touch && available.width < 1000 && available.height < 430));
  const width = nativeMobile
    ? available.width
    : device === "ipad" && orientation === "landscape"
      ? 1024
      : preset.width;
  const height = nativeMobile
    ? available.height
    : device === "ipad" && orientation === "landscape"
      ? 768
      : preset.height;

  useLayoutEffect(() => {
    const host = area.current!,
      element = frame.current!,
      box = presentation.current!;
    function fit() {
      const w = element.clientWidth,
        h = element.clientHeight;
      if (!w || !h || !host.clientWidth || !host.clientHeight) return;
      const scale = Math.min(1, host.clientWidth / w, host.clientHeight / h);
      element.style.transform = `scale(${scale})`;
      element.dataset.scale = String(scale);
      box.style.width = `${w * scale}px`;
      box.style.height = `${h * scale}px`;
    }
    const sizeObserver = new ResizeObserver(() => {
      setAvailable({
        width: host.clientWidth,
        height: host.clientHeight,
        touch: window.matchMedia("(pointer: coarse)").matches,
      });
      if (!initialized.current && host.clientWidth > 0) {
        initialized.current = true;
        initializeDevice(
          host.clientWidth < 700
            ? "mobile"
            : host.clientWidth < 1000
              ? "ipad"
              : host.clientWidth < 1300
                ? "laptop"
                : "desktop",
        );
      }
      fit();
    });
    const frameObserver = new ResizeObserver(fit);
    sizeObserver.observe(host);
    frameObserver.observe(element);
    return () => {
      sizeObserver.disconnect();
      frameObserver.disconnect();
    };
  }, [initializeDevice]);

  useLayoutEffect(() => {
    if (!device || !available.width || !available.height || fitted.current)
      return;
    // Establish the first layout without animating in from another device size.
    frame.current!.getBoundingClientRect();
    frame.current!.dataset.ready = "true";
    fitted.current = true;
  }, [device, available]);

  return (
    <div className={styles.stage}>
      <div ref={area} className={styles.availableArea}>
        <div ref={presentation} className={styles.presentation}>
          <div
            ref={frame}
            className={styles.logicalFrame}
            data-device-viewport={device || "preparing"}
            data-native-mobile={nativeMobile}
            style={{
              width: `${Math.max(1, width)}px`,
              height: `${Math.max(1, height)}px`,
            }}
          >
            <ProjectViewport>
              {device && available.width ? children : <ProjectLoading />}
            </ProjectViewport>
          </div>
        </div>
      </div>
    </div>
  );
}
