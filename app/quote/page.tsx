import { Footer } from "../../components/home/sections";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { PlanetWatermark } from "../../components/planet-watermark";
import QuoteExperience from "./quote-experience";
import styles from "./quote.module.css";

export default function QuotePage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <div className={pageStyles.body}>
        <div className={`${homeStyles.container} ${pageStyles.content}`}>
          <div className={`${pageStyles.intro} ${pageStyles.enter} ${styles.intro}`}>
            <h1>Request a Quote</h1>
            <p className={styles.headline}>Find the right website for your project.</p>
            <p>See our starting prices, compare what’s included, and tell us what you have in mind.</p>
          </div>
          <QuoteExperience />
        </div>
        <PlanetWatermark className={styles.watermark} sizes="(max-width: 620px) 400px, (max-width: 1050px) 640px, 800px" />
      </div>
      <Footer />
    </div>
  );
}
