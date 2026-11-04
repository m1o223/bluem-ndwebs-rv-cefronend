import Hero from "../components/home/hero";
import templateSpace from "../components/home/templates-space.module.css";
import { AboutSummary } from "../components/home/sections";
import styles from "../components/home/home.module.css";
import BrandIntro from "../components/brand-intro/brand-intro";
import WorkProcess from "../components/home/work-process";
import MeetAi from "../components/home/meet-ai";

export default function HomePage() {
  return <><BrandIntro /><div id="top" className={`home-page ${styles.home}`}><Hero /><WorkProcess /><MeetAi /><div id="selected-work" className={`${styles.showcase} ${templateSpace.space}`} aria-hidden="true" /><AboutSummary /></div></>;
}
