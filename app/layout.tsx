import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { LocalizationProvider } from "../components/localization-provider";
import WebsiteShell from "../components/website-shell";
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
          <WebsiteShell>{children}</WebsiteShell>
        </LocalizationProvider>
      </body>
    </html>
  );
}
