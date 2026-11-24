import Hero from "../components/home/hero";
import styles from "../components/home/home.module.css";
import BrandIntro from "../components/brand-intro/brand-intro";
import WhatWeDo from "../components/home/what-we-do";
import HomeFaq from "../components/home/home-faq";
import SiteFooter from "../components/site-footer";
import testEndStyles from "../components/home/test-home-end.module.css";

export default function HomePage() {
  return <>
    <BrandIntro />
    <div id="top" className={`home-page ${styles.home}`}>
      <Hero />
      <WhatWeDo />
      <div className={testEndStyles.endFlow} data-home-end-flow>
        <HomeFaq />
        <SiteFooter />
      </div>
    </div>
  </>;
}
