"use client";

import { X } from "lucide-react";
import type { CSSProperties, Ref } from "react";
import { useLocalization } from "../localization-provider";
import styles from "./project-viewer.module.css";
import type { DeviceMode, TabletOrientation } from "./device-preview";

type PreviewToolbarProps = {
  brand: string;
  category: string;
  titleId?: string;
  categoryId?: string;
  device: DeviceMode | null;
  orientation: TabletOrientation;
  onDeviceChange: (device: DeviceMode) => void;
  onOrientationChange: (orientation: TabletOrientation) => void;
  onClose: () => void;
  closeRef?: Ref<HTMLButtonElement>;
  disabled?: boolean;
};

export function DeviceIcon({ device }: { device: DeviceMode }) {
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

function OrientationIcon({ orientation }: { orientation: TabletOrientation }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {orientation === "portrait" ? (
        <rect x="7" y="3" width="10" height="18" rx="2" />
      ) : (
        <rect x="3" y="7" width="18" height="10" rx="2" />
      )}
    </svg>
  );
}

export default function PreviewToolbar({
  brand,
  category,
  titleId = "preview-title",
  categoryId,
  device,
  orientation,
  onDeviceChange,
  onOrientationChange,
  onClose,
  closeRef,
  disabled = false,
}: PreviewToolbarProps) {
  const { translate } = useLocalization();
  const activeDevice = device || "desktop";
  const activeIndex = activeDevice === "mobile" ? 0 : activeDevice === "ipad" ? 1 : 2;

  return (
    <header className={styles.topBar}>
      <div className={styles.windowIdentity}>
        <span className={styles.trafficLights} aria-hidden="true">
          <span className={styles.redLight} />
          <span className={styles.yellowLight} />
          <span className={styles.greenLight} />
        </span>
        <div className={styles.projectTitle}>
          <span className={styles.demoLabel}>{translate("Demo website")}</span>
          <strong id={titleId}>{brand}</strong>
          <span id={categoryId}>{category}</span>
        </div>
      </div>

      <div className={styles.deviceBar}>
        <div
          className={styles.deviceControls}
          data-active-index={activeIndex}
          role="group"
          aria-label={translate("Device preview")}
          style={{ "--active-index": activeIndex } as CSSProperties}
        >
          <span className={styles.deviceIndicator} aria-hidden="true" />
          <button
            type="button"
            className={styles.deviceOption}
            aria-pressed={activeDevice === "mobile"}
            disabled={disabled}
            onClick={() => onDeviceChange("mobile")}
          >
            <DeviceIcon device="mobile" />
            <span>iPhone</span>
          </button>
          <button
            type="button"
            className={styles.deviceOption}
            aria-pressed={activeDevice === "ipad"}
            disabled={disabled}
            onClick={() => onDeviceChange("ipad")}
          >
            <DeviceIcon device="ipad" />
            <span>iPad</span>
          </button>
          <button
            type="button"
            className={styles.deviceOption}
            aria-pressed={activeDevice === "desktop"}
            disabled={disabled}
            onClick={() => onDeviceChange("desktop")}
          >
            <DeviceIcon device="desktop" />
            <span>Desktop</span>
          </button>
        </div>
        <div
          className={styles.orientationControls}
          data-visible={activeDevice === "ipad"}
          data-active-index={orientation === "landscape" ? 1 : 0}
          role="group"
          aria-label="iPad orientation"
          aria-hidden={activeDevice !== "ipad"}
          style={{ "--active-index": orientation === "landscape" ? 1 : 0 } as CSSProperties}
        >
          <span className={styles.orientationIndicator} aria-hidden="true" />
          <button
            type="button"
            className={styles.orientationOption}
            aria-pressed={orientation === "portrait"}
            disabled={disabled || activeDevice !== "ipad"}
            onClick={() => onOrientationChange("portrait")}
          >
            <OrientationIcon orientation="portrait" />
            <span>Portrait</span>
          </button>
          <button
            type="button"
            className={styles.orientationOption}
            aria-pressed={orientation === "landscape"}
            disabled={disabled || activeDevice !== "ipad"}
            onClick={() => onOrientationChange("landscape")}
          >
            <OrientationIcon orientation="landscape" />
            <span>Landscape</span>
          </button>
        </div>
      </div>

      <div
        className={styles.windowActions}
        role="group"
        aria-label={translate("Preview window actions")}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.backButton}
          aria-label={translate("Close preview")}
          onClick={onClose}
        >
          {translate("Close")} <X size={15} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
