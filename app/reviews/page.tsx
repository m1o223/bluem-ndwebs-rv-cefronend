import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Reviews | BlueMind Web Service",
  description: "A preview layout for customer reviews at BlueMind Web Service.",
};

export default function ReviewsPage() {
  notFound();
}
