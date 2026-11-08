import Hero from "../components/home/hero";
import { AboutSummary } from "../components/home/sections";
import styles from "../components/home/home.module.css";
import BrandIntro from "../components/brand-intro/brand-intro";
import WorkProcess from "../components/home/work-process";
import MeetAi from "../components/home/meet-ai";
import WhatWeDo from "../components/home/what-we-do";

export default function HomePage() {
  return <><BrandIntro /><div id="top" className={`home-page ${styles.home}`}><Hero /><WhatWeDo /><WorkProcess /><MeetAi /><AboutSummary /></div></>;
}
