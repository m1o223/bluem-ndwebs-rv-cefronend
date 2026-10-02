import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navigation from "../components/navigation";
import PageContent from "../components/page-content";
import faviconMetadata from "./favicon-metadata.json";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlueMind Web Service",
  icons: faviconMetadata.icons,
  manifest: faviconMetadata.manifest,
};

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
