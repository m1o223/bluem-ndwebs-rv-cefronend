import type { Metadata } from "next";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import OurWorkPageContent from "../../components/our-work/our-work-page";

export const metadata: Metadata = {
  title: "Our Work | BlueMind Web Service",
  description: "A preview of a BlueMind Web Service website concept.",
};

export default function OurWorkPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <div className={pageStyles.body}>
        <div className={`${homeStyles.container} ${pageStyles.content}`}>
          <OurWorkPageContent />
        </div>
      </div>
    </div>
  );
}
