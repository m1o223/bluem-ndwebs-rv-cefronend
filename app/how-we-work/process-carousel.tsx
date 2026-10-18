"use client";

import CircularCarousel from "../../components/circular-carousel/circular-carousel";
import styles from "../../components/circular-carousel/circular-carousel.module.css";
import { useLocalization } from "../../components/localization-provider";
import { steps } from "./steps";

export default function ProcessCarousel() {
  const { locale, translate } = useLocalization();
  return <section className={styles.page} data-no-translate aria-labelledby="process-title">
    <header className={styles.intro} dir={locale === "ar" ? "rtl" : "ltr"}>
      <p className={styles.eyebrow}>{translate("How We Work")}</p>
      <h1 id="process-title">{locale === "en" ? "From Your Idea to a Finished Website." : translate("From your idea to a finished website.")}</h1>
    </header>
    <CircularCarousel items={steps} label="Our website project process" navigationLabel="Process navigation" stageTestId="process-stage" />
  </section>;
}
