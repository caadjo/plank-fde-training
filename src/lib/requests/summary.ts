import type { WorkRequest } from "./schema";

export function getRequestSummary(requests: WorkRequest[]) {
  const counts: Record<WorkRequest["status"], number> = {
    new: 0,
    in_progress: 0,
    completed: 0,
  };
  for (const request of requests) counts[request.status] += 1;
  return { counts, latest: requests.slice(0, 5) };
}
