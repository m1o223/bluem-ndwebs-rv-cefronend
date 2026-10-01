import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navigation from "../components/navigation";
import PageContent from "../components/page-content";
import "./globals.css";

export const metadata: Metadata = { title: "BlueMind Web Service" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <PageContent>{children}</PageContent>
      </body>
    </html>
  );
}
