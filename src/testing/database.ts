import { afterAll, beforeEach, vi } from "vitest";
import { closeDatabase, query } from "../lib/db";

// Every test file has its own module context and in-memory database.
vi.stubEnv("DATABASE_URL", "memory://");
vi.stubEnv("POSTHOG_KEY", "");
beforeEach(async () => {
  await query("TRUNCATE requests RESTART IDENTITY");
}, 20000);
afterAll(async () => {
  await closeDatabase();
});
