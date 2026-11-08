import Hero from "../components/home/hero";
import { AboutSummary } from "../components/home/sections";
import styles from "../components/home/home.module.css";
import BrandIntro from "../components/brand-intro/brand-intro";
import WhatWeDo from "../components/home/what-we-do";
import HomeFaq from "../components/home/home-faq";

export default function HomePage() {
  return <><BrandIntro /><div id="top" className={`home-page ${styles.home}`}><Hero /><WhatWeDo /><AboutSummary /><HomeFaq /></div></>;
}
