import { notFound } from "next/navigation";
import RestaurantDemo from "../restaurant-demo";

const sections = ["menu", "about", "gallery", "contact"] as const;

export function generateStaticParams() {
  return sections.map(section => ({ section }));
}

export default async function RestaurantDemoSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as (typeof sections)[number])) notFound();
  return <RestaurantDemo />;
}
