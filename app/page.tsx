import Hero from "../components/home/hero";
import styles from "../components/home/home.module.css";
import BrandIntro from "../components/brand-intro/brand-intro";
import WhatWeDo from "../components/home/what-we-do";
import HomeFaq from "../components/home/home-faq";
import TestGlobe from "../components/home/test-globe";
import TestHomeEnd from "../components/home/test-home-end";
import testEndStyles from "../components/home/test-home-end.module.css";

const TEST_SITE = process.env.NEXT_PUBLIC_TEST_SITE === "true";

export default function HomePage() {
  return <>
    <BrandIntro />
    <div id="top" className={`home-page ${styles.home}`}>
      <Hero />
      <WhatWeDo />
      {TEST_SITE ? (
        <>
          <TestGlobe />
          <div className={testEndStyles.endFlow} data-test-end-flow>
            <HomeFaq />
            <TestHomeEnd />
          </div>
        </>
      ) : <HomeFaq />}
    </div>
  </>;
}
