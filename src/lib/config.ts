export const config = {
  environment: process.env.VERCEL_ENV || "development",
  commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
  siteUrl: "https://plank-fde-training-one.vercel.app",
} as const;

// Read credentials only on the server; never pass this object to Client Components.
export const serverConfig = {
  get databaseUrl() {
    return process.env.DATABASE_URL || "";
  },
  get readOnlyDatabaseUrl() {
    return process.env.DATABASE_READONLY_URL || "";
  },
  get hosted() {
    return Boolean(process.env.VERCEL);
  },
  get posthogKey() {
    return process.env.POSTHOG_KEY || "";
  },
  get posthogHost() {
    return process.env.POSTHOG_HOST || "https://us.i.posthog.com";
  },
  get posthogApiHost() {
    return process.env.POSTHOG_API_HOST || "https://us.posthog.com";
  },
  get posthogProjectId() {
    return process.env.POSTHOG_PROJECT_ID || "";
  },
  get posthogPersonalKey() {
    return process.env.POSTHOG_PERSONAL_KEY || "";
  },
};
