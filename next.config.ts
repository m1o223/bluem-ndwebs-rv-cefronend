import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: { qualities: [75, 90] },
};
export default config;
