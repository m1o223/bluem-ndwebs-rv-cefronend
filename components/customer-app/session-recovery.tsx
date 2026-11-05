"use client";

import { useLocalization } from "../localization-provider";
import { workspaceCopy } from "./workspace-copy";
import styles from "./customer.module.css";

export default function SessionRecovery({ retry }: { retry?: () => void }) {
  const { locale } = useLocalization();
  const text = workspaceCopy[locale];
  return <main className={styles.main} dir={locale === "ar" ? "rtl" : "ltr"}>
    <div role="alert"><p>{text.loadError}</p>
      <button type="button" className={styles.secondary} onClick={retry ?? (() => window.location.reload())}>{text.retry}</button>
    </div>
  </main>;
}
