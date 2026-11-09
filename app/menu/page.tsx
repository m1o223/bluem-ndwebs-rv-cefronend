import type { Metadata } from "next";
import SiteMenuPage from "../../components/site-menu-page";

export const metadata: Metadata = { title: "Menu | BlueMind Web Service" };

export default function MenuPage() {
  return <SiteMenuPage />;
}
