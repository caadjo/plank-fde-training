import { z } from "zod";
import { requestStatuses, requestTeams } from "./schema";

export const requestFiltersSchema = z.object({
  team: z.enum(requestTeams).optional().catch(undefined),
  status: z.enum(requestStatuses).optional().catch(undefined),
});

export type RequestFilters = z.infer<typeof requestFiltersSchema>;

export function parseRequestFilters(params: {
  [key: string]: string | string[] | undefined;
}): RequestFilters {
  return requestFiltersSchema.parse(params);
}
