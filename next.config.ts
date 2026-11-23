import type { NextConfig } from "next";

// Test builds open the unfinished product pages without changing production behavior.
const isTestBuild = process.env.NEXT_PUBLIC_TEST_SITE === "true"
  || process.env.TEST_SITE === "true"
  || process.env.VERCEL_ENV === "preview"
  || process.env.VERCEL_GIT_COMMIT_REF === "test";

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: { qualities: [75, 90] },
  env: { NEXT_PUBLIC_TEST_SITE: isTestBuild ? "true" : "false" },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      ],
    }];
  },
};
export default config;
