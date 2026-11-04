import type { Metadata } from "next";
import ProjectShowcase from "../../components/home/project-showcase";
import styles from "../../components/home/home.module.css";

export const metadata: Metadata = {
  title: "Website Concepts | BlueMind Web Service",
  description: "Explore original, interactive website concepts across different industries.",
};

export default function TemplatesPage() {
  return <div className={styles.home}><ProjectShowcase headingAs="h1" /></div>;
}
