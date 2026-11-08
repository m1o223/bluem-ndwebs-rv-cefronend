"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocalization } from "../localization-provider";
import TextActionLabel from "../text-action-label";
import { whatWeBuildCopy } from "./what-we-build-copy";
import styles from "./what-we-build.module.css";

export default function WhatWeBuild() {
  const { locale } = useLocalization();
  const text = whatWeBuildCopy[locale];
  const root = useRef<HTMLElement>(null);
  const loaded = useRef(new Set<string>());
  const [imagesReady, setImagesReady] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started || !imagesReady || !root.current) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const element = root.current.querySelector("[data-build-stage]")!;
    let inView = false;
    const begin = () => {
      if (motion.matches || (inView && !window.__blueMindIntro?.playing)) setStarted(true);
    };
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; begin(); }, { threshold: .3 });
    // The intro can cover an otherwise visible stage. Wait for its removal before starting.
    const introObserver = new MutationObserver(begin);
    if (window.__blueMindIntro?.playing) introObserver.observe(document.body, { childList: true, subtree: true });
    observer.observe(element); motion.addEventListener("change", begin); begin();
    return () => { observer.disconnect(); introObserver.disconnect(); motion.removeEventListener("change", begin); };
  }, [imagesReady, started]);

  function imageReady(device: string) {
    loaded.current.add(device);
    if (loaded.current.size === 3) setImagesReady(true);
  }

  return <section ref={root} className={styles.section} data-build-section data-hero-visual data-started={started} dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate aria-labelledby="what-we-build-title">
    <h2 id="what-we-build-title" className={styles.title}>{text.title}</h2>
    <div className={styles.stage} data-build-stage>
      <div className={styles.group} data-build-group dir="ltr">
        <div className={`${styles.device} ${styles.desktop}`} data-build-device="desktop"><Image src="/images/folio-books/folio-desktop.webp" alt={text.desktop} width={1280} height={882} sizes="(max-width: 620px) 34vw, 430px" loading="eager" onLoad={() => imageReady("desktop")} /></div>
        <div className={`${styles.device} ${styles.tablet}`} data-build-device="tablet"><Image src="/images/folio-books/folio-tablet.webp" alt={text.tablet} width={1100} height={769} sizes="(max-width: 620px) 28vw, 360px" loading="eager" fetchPriority="high" onLoad={() => imageReady("tablet")} /></div>
        <div className={`${styles.device} ${styles.phone}`} data-build-device="phone"><Image src="/images/folio-books/folio-phone.webp" alt={text.phone} width={640} height={1296} sizes="(max-width: 620px) 15vw, 170px" loading="eager" onLoad={() => imageReady("phone")} /></div>
      </div>
    </div>
    <div className={styles.content}>
      <p className={`${styles.description} ${styles.reveal}`} data-build-description>{text.description}</p>
      <ul className={`${styles.types} ${styles.reveal}`} aria-label={text.title}>{text.types.map(type => <li key={type}>{type}</li>)}</ul>
      <p className={`${styles.features} ${styles.reveal}`}>{text.features}</p>
      <p className={`${styles.invitation} ${styles.reveal}`}>{text.invitation}</p>
      <Link href="/quote" className={`${styles.cta} ${styles.reveal}`}><TextActionLabel light>{text.cta}</TextActionLabel><ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div>
  </section>;
}
