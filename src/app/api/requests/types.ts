import { z } from "zod";
import { requestInputSchema, workRequestSchema } from "@/lib/requests/schema";

export const createRequestBodySchema = requestInputSchema;
export const createRequestResponseSchema = z.strictObject({
  request: workRequestSchema,
});
export const listRequestsResponseSchema = z.strictObject({
  requests: z.array(workRequestSchema),
});
export const requestErrorResponseSchema = z.strictObject({
  error: z.string(),
  issues: z
    .array(
      z.strictObject({
        code: z.string(),
        path: z.array(z.union([z.string(), z.number()])),
        message: z.string(),
      }),
    )
    .optional(),
});

export type CreateRequestBody = z.input<typeof createRequestBodySchema>;
export type CreateRequestResponse = z.infer<typeof createRequestResponseSchema>;
export type ListRequestsResponse = z.infer<typeof listRequestsResponseSchema>;
export type RequestErrorResponse = z.infer<typeof requestErrorResponseSchema>;
