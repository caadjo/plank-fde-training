import { z } from "zod";

export const healthResponseSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("ok"),
    database: z.literal("ok"),
    commit: z.string(),
  }),
  z.strictObject({
    status: z.literal("error"),
    database: z.literal("unavailable"),
    commit: z.string(),
  }),
]);
export type HealthResponse = z.infer<typeof healthResponseSchema>;
