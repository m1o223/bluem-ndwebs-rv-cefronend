import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isTestBuild = process.env.NEXT_PUBLIC_TEST_SITE === "true"
    || process.env.TEST_SITE === "true"
    || process.env.VERCEL_ENV === "preview"
    || process.env.VERCEL_GIT_COMMIT_REF === "test";

  return isTestBuild
    ? { rules: { userAgent: "*", disallow: "/" } }
    : { rules: { userAgent: "*", allow: "/" } };
}
