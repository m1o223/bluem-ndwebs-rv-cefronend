import type { Metadata } from "next";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import CareSubscriptionDemoFlow from "./care-subscription-demo-flow";
import styles from "./care.module.css";

export const metadata: Metadata = { title: "BlueMind Care | BlueMind Web Service", description: "Website care, updates and support — without the technical hassle." };
export default function CarePage() {
  return <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
    <div className={pageStyles.body}>
      <div className={`${homeStyles.container} ${pageStyles.content}`}>
        <div className={`${pageStyles.intro} ${pageStyles.enter} ${styles.intro}`}>
          <h1>BlueMind Care</h1>
          <p className={styles.byline}>by BlueMind Web Service</p>
          <p className={styles.headline}>Your website. Our care.</p>
          <p>We take care of your website, so you can focus on your business.</p>
        </div>
        <CareSubscriptionDemoFlow />
      </div>
    </div>
  </div>;
}

