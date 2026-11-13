import type { Metadata } from "next";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import FaqPageContent from "../../components/faq/faq-page-content";
import faqStyles from "../../components/faq/faq-page.module.css";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | BlueMind Web Service",
  description: "Answers to common questions about BlueMind Web Service.",
};

export default function FaqPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page} ${faqStyles.page}`}>
      <div className={pageStyles.body}>
        <div className={`${homeStyles.container} ${pageStyles.content}`}>
          <FaqPageContent />
        </div>
      </div>
    </div>
  );
}
