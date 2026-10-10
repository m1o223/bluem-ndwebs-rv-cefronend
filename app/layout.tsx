import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "../components/home/sections";
import { LocalizationProvider } from "../components/localization-provider";
import Navigation from "../components/navigation";
import PageContent from "../components/page-content";
import faviconMetadata from "./favicon-metadata.json";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BlueMind Web Service",
  icons: faviconMetadata.icons,
  manifest: faviconMetadata.manifest,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <LocalizationProvider>
          <Navigation />
          <PageContent>{children}</PageContent>
          <Footer />
        </LocalizationProvider>
      </body>
    </html>
  );
}
