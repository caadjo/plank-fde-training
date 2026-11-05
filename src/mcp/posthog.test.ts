import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPosthogApi } from "./posthog-api";
import { posthogServer } from "./posthog";

const config = {
  host: "https://us.posthog.com",
  projectId: "42",
  key: "secret-personal-key",
};
const visitor = "c0b91ad0-04c6-4e2a-8a78-fcda241411ac";
const requestId = "a76ab7ee-9653-471c-b042-a9c3fe0411f1";
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  vi.useRealTimers();
});
async function connect(fetcher: typeof fetch) {
  const server = posthogServer(createPosthogApi(config, fetcher));
  const client = new Client({ name: "posthog-test", version: "1.0.0" });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  cleanups.push(async () => {
    await client.close();
    await server.close();
  });
  return client;
}
const json = (value: unknown) =>
  new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
  });
function body(response: Awaited<ReturnType<Client["callTool"]>>) {
  return JSON.parse((response.content as { text: string }[])[0].text);
}

describe("PostHog MCP", () => {
  it("builds event filters and strips internal properties, profiles and arbitrary visitor text", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      json({
        next: null,
        results: [
          {
            id: "event-id",
            event: "request_viewed",
            timestamp: "2026-11-05T13:00:00Z",
            distinct_id: visitor,
            person: { email: "private@example.com" },
            properties: {
              requestId,
              team: "finance",
              $ip: "private",
              nested: { $secret: "private", valid: true },
            },
          },
        ],
      }),
    );
    const client = await connect(fetcher);
    const response = await client.callTool({
      name: "get-events",
      arguments: {
        event: "request_viewed",
        visitor,
        after: "2026-11-05T12:00:00Z",
        before: "2026-11-05T14:00:00Z",
      },
    });
    const [url, init] = fetcher.mock.calls[0];
    const parsedUrl = new URL(String(url));
    expect(parsedUrl.pathname).toBe("/api/projects/42/events/");
    expect(Object.fromEntries(parsedUrl.searchParams)).toMatchObject({
      event: "request_viewed",
      distinct_id: visitor,
      after: "2026-11-05T12:00:00Z",
      before: "2026-11-05T14:00:00Z",
    });
    expect(init?.headers).toEqual({
      Authorization: "Bearer secret-personal-key",
    });
    expect(body(response)).toEqual({
      events: [
        {
          id: "event-id",
          event: "request_viewed",
          timestamp: "2026-11-05T13:00:00Z",
          visitor,
          properties: { requestId, team: "finance", nested: { valid: true } },
        },
      ],
      truncated: false,
    });
    expect(JSON.stringify(response)).not.toContain("private");
  });

  it("follows event-definition pages and returns only names and last-seen timestamps", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        json({
          results: [
            {
              name: "request_viewed",
              last_seen_at: "2026-11-05T13:00:00Z",
              created_by: { email: "private" },
            },
          ],
          next: "https://us.posthog.com/api/projects/42/event_definitions/?offset=100",
        }),
      )
      .mockResolvedValueOnce(
        json({
          results: [{ name: "request_submitted", last_seen_at: null }],
          next: null,
        }),
      );
    const client = await connect(fetcher);
    const response = await client.callTool({
      name: "get-event-definitions",
      arguments: {},
    });
    expect(String(fetcher.mock.calls[0][0])).toContain("/event_definitions/");
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(body(response)).toEqual({
      definitions: [
        { name: "request_viewed", last_seen_at: "2026-11-05T13:00:00Z" },
        { name: "request_submitted", last_seen_at: null },
      ],
      truncated: false,
    });
  });

  it("checks events using a bounded time window and reports absent events honestly", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-05T14:00:00Z"));
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(json({ results: [], next: null }));
    const client = await connect(fetcher);
    const response = await client.callTool({
      name: "check-event-fired",
      arguments: { event: "request_submitted", minutes: 10 },
    });
    const url = new URL(String(fetcher.mock.calls[0][0]));
    expect(url.searchParams.get("after")).toBe("2026-11-05T13:50:00.000Z");
    expect(url.searchParams.get("before")).toBe("2026-11-05T14:00:00.000Z");
    expect(body(response)).toEqual({
      fired: false,
      message: "request_submitted was not captured in the last 10 minutes.",
    });
    const invalid = await client.callTool({
      name: "check-event-fired",
      arguments: { event: "request_submitted", minutes: -1 },
    });
    expect(invalid.isError).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not forward credentials to pagination on another host or leak error bodies", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      json({
        results: [],
        next: "https://attacker.example/api/projects/42/event_definitions/",
      }),
    );
    const client = await connect(fetcher);
    expect(
      (await client.callTool({ name: "get-event-definitions", arguments: {} }))
        .isError,
    ).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    fetcher.mockResolvedValueOnce(
      new Response("secret-personal-key", { status: 401 }),
    );
    const failure = await client.callTool({
      name: "get-events",
      arguments: {},
    });
    expect(failure.isError).toBe(true);
    expect(JSON.stringify(failure)).not.toContain("secret-personal-key");
  });

  it("rejects inverted time windows before making a request", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const client = await connect(fetcher);
    const response = await client.callTool({
      name: "get-events",
      arguments: {
        after: "2026-11-06T00:00:00Z",
        before: "2026-11-05T00:00:00Z",
      },
    });
    expect(response.isError).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
