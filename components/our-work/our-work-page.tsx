"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ProjectViewport } from "../portfolio/shared";
import RestaurantProject from "../portfolio/restaurant";
import { useLocalization, type Locale } from "../localization-provider";
import styles from "./our-work-page.module.css";

type WorkCopy = {
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  projectName: string;
  category: string;
  projectDescription: string;
  features: string[];
  preview: string;
  note: string;
};

type WorkProject = {
  previewPath: string;
  brand: string;
};

// Replace this project object when a real client project is ready. The layout stays unchanged.
const project: WorkProject = {
  previewPath: "/templates/sera",
  brand: "SERA",
};

const copy: Record<Locale, WorkCopy> = {
  en: {
    eyebrow: "SELECTED WORK",
    title: "Our Work",
    description: "A closer look at how a BlueMind website concept can come together around a clear idea.",
    badge: "Demo project from our templates",
    projectName: "SERA Italian Kitchen",
    category: "Restaurant website",
    projectDescription: "A warm restaurant concept built around seasonal food, a readable menu and an easy way to discover the space before visiting.",
    features: ["Food menu", "Photo gallery", "Mobile-friendly"],
    preview: "Preview website",
    note: "Demo concept — not a published client website.",
  },
  sv: {
    eyebrow: "UTVALT ARBETE",
    title: "Vårt arbete",
    description: "En närmare titt på hur ett BlueMind-koncept kan växa fram kring en tydlig idé.",
    badge: "Demoprojekt från våra mallar",
    projectName: "SERA Italian Kitchen",
    category: "Restaurangwebbplats",
    projectDescription: "Ett varmt restaurangkoncept med säsongsbetonad mat, en lättläst meny och ett enkelt sätt att upptäcka platsen före besöket.",
    features: ["Meny", "Bildgalleri", "Mobilanpassad"],
    preview: "Förhandsvisa webbplatsen",
    note: "Demokoncept — inte en publicerad kundwebbplats.",
  },
  ar: {
    eyebrow: "\u0623\u0639\u0645\u0627\u0644 \u0645\u062e\u062a\u0627\u0631\u0629",
    title: "\u0623\u0639\u0645\u0627\u0644\u0646\u0627",
    description: "\u0646\u0638\u0631\u0629 \u0623\u0642\u0631\u0628 \u0639\u0644\u0649 \u0637\u0631\u064a\u0642\u0629 \u0628\u0646\u0627\u0621 \u0646\u0645\u0648\u0630\u062c \u0645\u0648\u0642\u0639 \u0645\u0646 BlueMind \u062d\u0648\u0644 \u0641\u0643\u0631\u0629 \u0648\u0627\u0636\u062d\u0629 \u0648\u0645\u062a\u0643\u0627\u0645\u0644\u0629.",
    badge: "\u0645\u0634\u0631\u0648\u0639 \u062a\u062c\u0631\u064a\u0628\u064a \u0645\u0646 \u0642\u0648\u0627\u0644\u0628\u0646\u0627",
    projectName: "SERA Italian Kitchen",
    category: "\u0645\u0648\u0642\u0639 \u0645\u0637\u0639\u0645",
    projectDescription: "\u0646\u0645\u0648\u0630\u062c \u0645\u0637\u0639\u0645 \u062f\u0627\u0641\u0626 \u064a\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u0637\u0639\u0627\u0645 \u0627\u0644\u0645\u0648\u0633\u0645\u064a\u060c \u0648\u0642\u0627\u0626\u0645\u0629 \u0633\u0647\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0621\u0629\u060c \u0648\u0637\u0631\u064a\u0642\u0629 \u0628\u0633\u064a\u0637\u0629 \u0644\u0644\u062a\u0639\u0631\u0651\u0641 \u0639\u0644\u0649 \u0627\u0644\u0645\u0643\u0627\u0646 \u0642\u0628\u0644 \u0632\u064a\u0627\u0631\u062a\u0647.",
    features: ["\u0642\u0627\u0626\u0645\u0629 \u0637\u0639\u0627\u0645", "\u0645\u0639\u0631\u0636 \u0635\u0648\u0631", "\u0645\u062a\u0648\u0627\u0641\u0642 \u0645\u0639 \u0627\u0644\u062c\u0648\u0627\u0644"],
    preview: "\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0645\u0648\u0642\u0639",
    note: "\u0646\u0645\u0648\u0630\u062c \u062a\u062c\u0631\u064a\u0628\u064a \u2014 \u0644\u064a\u0633 \u0645\u0648\u0642\u0639 \u0639\u0645\u064a\u0644 \u0645\u0646\u0634\u0648\u0631\u064b\u0627.",
  },
};

export default function OurWorkPageContent() {
  const { locale } = useLocalization();
  const text = copy[locale];
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <main className={styles.page} dir={direction} data-no-translate>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p className={styles.description}>{text.description}</p>
      </header>

      <article className={styles.projectCard}>
        <div className={styles.previewColumn}>
          <div className={styles.browserBar}>
            <span className={styles.trafficLights} aria-hidden="true"><i /><i /><i /></span>
            <span className={styles.browserTitle}>{project.brand} — {text.category}</span>
            <span className={styles.browserLabel}>{text.badge}</span>
          </div>
          <div className={styles.previewViewport} aria-label={`${text.projectName} ${text.category}`}>
            <ProjectViewport><RestaurantProject /></ProjectViewport>
          </div>
        </div>

        <div className={styles.projectDetails}>
          <span className={styles.badge}>{text.badge}</span>
          <h2>{text.projectName}</h2>
          <p className={styles.category}>{text.category}</p>
          <p className={styles.projectDescription}>{text.projectDescription}</p>
          <ul className={styles.features}>
            {text.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
          <Link className={styles.previewButton} href={project.previewPath}>
            <span>{text.preview}</span><ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <p className={styles.note}>{text.note}</p>
        </div>
      </article>
    </main>
  );
}
