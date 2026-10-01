import Hero from "../components/home/hero";
import ProjectShowcase from "../components/home/project-showcase";
import { AboutSummary, FinalCTA, Footer } from "../components/home/sections";
import styles from "../components/home/home.module.css";

export default function HomePage() {
  return <div id="top" className={`home-page ${styles.home}`}><Hero /><ProjectShowcase /><AboutSummary /><FinalCTA /><Footer /></div>;
}
