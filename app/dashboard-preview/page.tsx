import type { Metadata } from "next";
import DashboardPreview from "./preview-screen";

export const metadata: Metadata = {
  title: "Dashboard Preview | BlueMind Web Service",
  robots: { index: false, follow: false },
};

export default function DashboardPreviewPage() {
  return <DashboardPreview />;
}
