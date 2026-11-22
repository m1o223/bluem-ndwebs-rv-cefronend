import type { Metadata } from "next";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import ReviewsPageContent from "../../components/reviews/reviews-page";

export const metadata: Metadata = {
  title: "Reviews | BlueMind Web Service",
  description: "A preview layout for customer reviews at BlueMind Web Service.",
};

export default function ReviewsPage() {
  return (
    <div id="top" data-reviews-page="true" className={`${homeStyles.home} ${pageStyles.page}`}>
      <div className={pageStyles.body} data-reviews-body>
        <div className={`${homeStyles.container} ${pageStyles.content}`}>
          <ReviewsPageContent />
        </div>
      </div>
    </div>
  );
}
