import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter/wght.css";
import { LocalizationProvider } from "../components/localization-provider";
import TestEnvironmentBanner from "../components/test-environment-banner";
import WebsiteShell from "../components/website-shell";
import CookieConsent from "../components/cookie-consent";
import faviconMetadata from "./favicon-metadata.json";
import "./globals.css";

const isTestBuild = process.env.NEXT_PUBLIC_TEST_SITE === "true"
  || process.env.TEST_SITE === "true"
  || process.env.VERCEL_ENV === "preview"
  || process.env.VERCEL_GIT_COMMIT_REF === "test";

export const metadata: Metadata = {
  title: "BlueMind Web Service",
  ...(isTestBuild ? { robots: { index: false, follow: false } } : {}),
  icons: faviconMetadata.icons,
  manifest: faviconMetadata.manifest,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LocalizationProvider>
          <TestEnvironmentBanner />
          <WebsiteShell>{children}</WebsiteShell>
          <CookieConsent />
        </LocalizationProvider>
      </body>
    </html>
  );
}
