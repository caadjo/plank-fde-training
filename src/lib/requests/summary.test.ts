import { describe, expect, it } from "vitest";
import { getRequestSummary } from "./summary";
import type { WorkRequest } from "./schema";

const base: WorkRequest = {
  id: "c0b91ad0-04c6-4e2a-8a78-fcda241411ac",
  title: "Solicitação",
  details: "",
  team: "operations",
  priority: "medium",
  status: "new",
  createdAt: "2026-11-02T12:00:00.000Z",
};

describe("getRequestSummary", () => {
  it("counts all statuses, including ones with no requests", () => {
    expect(
      getRequestSummary([
        { ...base },
        { ...base, status: "in_progress" },
        { ...base },
      ]).counts,
    ).toEqual({ new: 2, in_progress: 1, completed: 0 });
  });
  it("takes at most the five most recent items without modifying the input", () => {
    const requests = Array.from({ length: 7 }, (_, index) => ({
      ...base,
      title: "Solicitação " + index,
    }));
    const summary = getRequestSummary(requests);
    expect(summary.latest.map((request) => request.title)).toEqual(
      requests.slice(0, 5).map((request) => request.title),
    );
    expect(requests).toHaveLength(7);
    expect(summary.counts.new).toBe(7);
  });
  it("handles an empty store", () => {
    expect(getRequestSummary([])).toEqual({
      counts: { new: 0, in_progress: 0, completed: 0 },
      latest: [],
    });
  });
});
