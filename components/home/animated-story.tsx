"use client";

import { useState } from "react";
import { useLocalization, type Locale } from "../localization-provider";
import styles from "./work-process.module.css";

export type StoryCopy = {
  title: string;
  instructions: string;
  steps: readonly (readonly [string, string])[];
};

type AnimatedStoryProps = {
  id: string;
  titleId: string;
  content: Record<Locale, StoryCopy>;
};

export default function AnimatedStory({ id, titleId, content }: AnimatedStoryProps) {
  const { locale } = useLocalization();
  const copy = content[locale];
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const rtl = locale === "ar";

  return (
    <section id={id} className={styles.section} aria-labelledby={titleId} lang={locale} dir={rtl ? "rtl" : "ltr"} data-no-translate>
      <h2 id={titleId} className={styles.srOnly}>{copy.title}</h2>
      <p id={`${id}-instructions`} className={styles.srOnly}>{copy.instructions}</p>
      <ol className={styles.srOnly}>{copy.steps.map(lines => <li key={lines.join(" ")}>{lines.join(" ")}</li>)}</ol>
      <div className={styles.device} data-work-card data-playing="false" data-static="true" role="group" tabIndex={0}
        aria-labelledby={titleId} aria-describedby={`${id}-instructions`}
        onKeyDown={event => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            setPaused(current => !current);
          } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            const direction = (event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1);
            setPaused(true);
            setStep(current => (current + direction + copy.steps.length) % copy.steps.length);
          }
        }}>
        <div className={styles.frame} data-device-frame>
          <div className={styles.screen} data-device-screen>
            <div className={styles.screenContent} data-screen-content aria-hidden="true">
              <div className={styles.textArea} data-story-text>
                <p key={`${locale}-${step}`} className={styles.sentence} data-work-step={step + 1}>
                  <span className={styles.line} data-story-line>{copy.steps[step][0]}</span>{" "}
                  <span className={styles.line} data-story-line>{copy.steps[step][1]}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
