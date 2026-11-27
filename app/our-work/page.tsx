import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Our Work | BlueMind Web Service",
  description: "A preview of a BlueMind Web Service website concept.",
};

export default function OurWorkPage() {
  notFound();
}
