import type { Metadata } from "next";
import { ComingSoonPage } from "../../components/ai-coming-soon";

export const metadata: Metadata = {
  title: "Subscriptions | BlueMind Web Service",
  description: "BlueMind subscriptions are coming soon.",
};

export default function CarePage() {
  return <ComingSoonPage kind="subscriptions" />;
}
