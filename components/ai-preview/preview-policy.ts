export function isAiPreviewEnabled(env: { VERCEL_ENV?: string; NODE_ENV?: string; VERCEL?: string }) {
  if (env.VERCEL_ENV) return env.VERCEL_ENV === "preview";
  return env.NODE_ENV === "development" && !env.VERCEL;
}
