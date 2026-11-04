import Hero from "../components/home/hero";
import ProjectShowcase from "../components/home/project-showcase";
import { AboutSummary } from "../components/home/sections";
import styles from "../components/home/home.module.css";
import BrandIntro from "../components/brand-intro/brand-intro";

export default function HomePage() {
  return <><BrandIntro /><div id="top" className={`home-page ${styles.home}`}><Hero /><ProjectShowcase /><AboutSummary /></div></>;
}
