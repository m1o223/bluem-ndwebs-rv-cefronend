import type { NextConfig } from "next";

// Test builds open the unfinished product pages without changing production behavior.
const isTestBuild = process.env.NEXT_PUBLIC_TEST_SITE === "true" || process.env.VERCEL_GIT_COMMIT_REF === "test";

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: { qualities: [75, 90] },
  env: { NEXT_PUBLIC_TEST_SITE: isTestBuild ? "true" : "false" },
};
export default config;
