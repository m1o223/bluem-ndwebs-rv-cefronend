import Hero from "../components/home/hero";
import ProjectShowcase from "../components/home/project-showcase";
import { AboutSummary } from "../components/home/sections";
import styles from "../components/home/home.module.css";
import BrandIntro from "../components/brand-intro/brand-intro";

export default function HomePage() {
  const replayIntro = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development";
  return <>{process.env.VERCEL_ENV !== "production" && <BrandIntro replayOnRefresh={replayIntro} />}<div id="top" className={`home-page ${styles.home}`}><Hero /><ProjectShowcase /><AboutSummary /></div></>;
}
