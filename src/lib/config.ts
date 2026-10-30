export const config = {
  environment: process.env.VERCEL_ENV || "development",
  commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
  siteUrl: "https://plank-fde-training-one.vercel.app",
} as const;
