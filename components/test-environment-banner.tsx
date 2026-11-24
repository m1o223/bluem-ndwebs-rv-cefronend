"use client";

import { usePathname } from "next/navigation";
import styles from "./test-environment-banner.module.css";

const TEST_SITE = process.env.NEXT_PUBLIC_TEST_SITE === "true";

export default function TestEnvironmentBanner() {
  const pathname = usePathname();
  if (!TEST_SITE || pathname.startsWith("/demo/restaurant")) return null;

  return (
    <div className={styles.banner} role="status" aria-label="Test environment">
      <strong>BlueMind Web Service — Test</strong>
      <span>Test environment · no live customer data</span>
    </div>
  );
}
