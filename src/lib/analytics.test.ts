import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { track, Track } from "./analytics";

const { after, cookies, headers } = vi.hoisted(() => ({
  after: vi.fn(),
  cookies: vi.fn(),
  headers: vi.fn(),
}));
vi.mock("next/server", () => ({ after }));
vi.mock("next/cache", () => ({ io: vi.fn().mockResolvedValue(undefined) }));
vi.mock("next/headers", () => ({ cookies, headers }));
const visitor = "c0b91ad0-04c6-4e2a-8a78-fcda241411ac";
const requestId = "a76ab7ee-9653-471c-b042-a9c3fe0411f1";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("POSTHOG_KEY", "test-project-key");
  vi.stubEnv("POSTHOG_HOST", "https://us.i.posthog.com");
  cookies.mockResolvedValue({ get: () => ({ value: visitor }) });
  headers.mockResolvedValue(new Headers());
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("funnel analytics", () => {
  it("does nothing without the project key", async () => {
    vi.stubEnv("POSTHOG_KEY", "");
    await Track();
    expect(cookies).not.toHaveBeenCalled();
    expect(after).not.toHaveBeenCalled();
  });
  it("schedules all four events after the response with anonymous IDs and record properties", async () => {
    await Track();
    await track("request_submitted", { requestId, team: "finance" });
    await track("request_viewed", { requestId, team: "finance" });
    await track("request_status_changed", {
      requestId,
      team: "finance",
      status: "completed",
    });
    expect(fetch).not.toHaveBeenCalled();
    for (const [callback] of after.mock.calls) await callback();
    expect(fetch).toHaveBeenCalledTimes(4);
    const bodies = vi
      .mocked(fetch)
      .mock.calls.map(([, init]) => JSON.parse(init!.body as string));
    expect(bodies.map((body) => body.event)).toEqual([
      "request_form_viewed",
      "request_submitted",
      "request_viewed",
      "request_status_changed",
    ]);
    expect(bodies.every((body) => body.distinct_id === visitor)).toBe(true);
    expect(
      bodies.slice(1).every((body) => body.properties.requestId === requestId),
    ).toBe(true);
    expect(bodies[0].properties.$process_person_profile).toBe(false);
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toBe(
      "https://us.i.posthog.com/i/v0/e/",
    );
  });
  it("skips prefetches and untrusted visitor cookies", async () => {
    headers.mockResolvedValueOnce(new Headers({ "next-router-prefetch": "1" }));
    await Track();
    cookies.mockResolvedValue({ get: () => ({ value: "person@example.com" }) });
    await Track();
    expect(after).not.toHaveBeenCalled();
  });
  it("rejects extra properties and isolates capture failures from the user action", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    await track("request_submitted", {
      requestId,
      team: "finance",
      title: "private",
    } as never);
    expect(after).not.toHaveBeenCalled();
    await Track();
    vi.mocked(fetch).mockRejectedValueOnce(new Error("secret"));
    await expect(after.mock.calls[0][0]()).resolves.toBeUndefined();
    expect(warning).toHaveBeenCalledWith("Analytics capture failed.");
    warning.mockRestore();
  });
});
