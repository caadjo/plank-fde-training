import { describe, expect, it } from "vitest";
import { parseRequestFilters } from "./filters";
import { requestStatuses, requestTeams } from "./schema";

describe("request filters", () => {
  it("accepts every shared enum combination", () => {
    for (const team of requestTeams)
      for (const status of requestStatuses)
        expect(parseRequestFilters({ team, status })).toEqual({ team, status });
  });

  it("accepts missing filters and discards unrelated parameters", () => {
    expect(parseRequestFilters({ q: "ignored" })).toEqual({});
  });

  it.each(
    [
      "unknown",
      "",
      ["finance", "support"],
      ["finance"],
      ["finance", "finance"],
    ].map((team) => ({ team })),
  )("ignores invalid or repeated teams: %j", ({ team }) => {
    expect(parseRequestFilters({ team, status: "new" })).toEqual({
      team: undefined,
      status: "new",
    });
  });

  it.each(
    ["unknown", "", ["new", "completed"], ["new"], ["new", "new"]].map(
      (status) => ({ status }),
    ),
  )("ignores invalid or repeated statuses: %j", ({ status }) => {
    expect(parseRequestFilters({ team: "finance", status })).toEqual({
      team: "finance",
      status: undefined,
    });
  });
});
