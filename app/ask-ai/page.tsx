import Link from "next/link";
import { X } from "lucide-react";
import styles from "./page.module.css";

export default function AskAiPage() {
  return <main className={styles.page} data-no-translate>
    <Link href="/" className={styles.close} aria-label="Close"><X size={22} aria-hidden="true" /></Link>
  </main>;
}
