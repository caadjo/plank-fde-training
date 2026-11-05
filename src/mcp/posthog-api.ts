import { z } from "zod";

const pageSchema = z.object({
  results: z.array(z.unknown()),
  next: z.string().nullable().optional(),
});
const eventSchema = z.object({
  id: z.string().optional(),
  event: z.string(),
  timestamp: z.iso.datetime({ offset: true }),
  distinct_id: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).default({}),
});
const definitionSchema = z.object({
  name: z.string(),
  last_seen_at: z.string().nullable().optional(),
});

function stripInternal(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripInternal);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith("$"))
        .map(([key, entry]) => [key, stripInternal(entry)]),
    );
  return value;
}

export type EventFilters = {
  event?: string;
  visitor?: string;
  after?: string;
  before?: string;
};

export function createPosthogApi(
  config: { host: string; projectId: string; key: string },
  fetcher: typeof fetch = fetch,
) {
  if (!/^\d+$/.test(config.projectId) || !config.key)
    throw new Error("Configure the PostHog project and personal read key.");
  const host = new URL(config.host);
  if (
    host.protocol !== "https:" &&
    !(
      host.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(host.hostname)
    )
  ) {
    throw new Error("PostHog requires HTTPS outside localhost.");
  }
  const root = `/api/projects/${config.projectId}/`;
  async function page(path: string, params: Record<string, string> = {}) {
    const url = new URL(root + path + "/", host);
    for (const [key, value] of Object.entries({ limit: "100", ...params }))
      url.searchParams.set(key, value);
    return readPage(url);
  }
  async function readPage(url: URL) {
    const response = await fetcher(url, {
      headers: { Authorization: `Bearer ${config.key}` },
      signal: AbortSignal.timeout(10000),
      redirect: "error",
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(`PostHog read failed (${response.status}).`);
    return pageSchema.parse(await response.json());
  }
  return {
    async events(filters: EventFilters = {}) {
      const params: Record<string, string> = {};
      if (filters.event) params.event = filters.event;
      if (filters.visitor) params.distinct_id = filters.visitor;
      if (filters.after) params.after = filters.after;
      if (filters.before) params.before = filters.before;
      const data = await page("events", params);
      return {
        events: data.results.map((raw) => {
          const event = eventSchema.parse(raw);
          return {
            id: event.id,
            event: event.event,
            timestamp: event.timestamp,
            visitor: z.uuid().safeParse(event.distinct_id).success
              ? event.distinct_id
              : undefined,
            properties: stripInternal(event.properties),
          };
        }),
        truncated: Boolean(data.next),
      };
    },
    async definitions() {
      let data = await page("event_definitions");
      const definitions = data.results.map((row) =>
        definitionSchema.parse(row),
      );
      const visited = new Set<string>();
      while (data.next && visited.size < 100) {
        const next = new URL(data.next, host);
        if (
          next.origin !== host.origin ||
          next.pathname !== root + "event_definitions/"
        )
          throw new Error("Invalid pagination destination.");
        if (visited.has(next.href))
          throw new Error("Repeated pagination destination.");
        visited.add(next.href);
        data = await readPage(next);
        definitions.push(
          ...data.results.map((row) => definitionSchema.parse(row)),
        );
      }
      return { definitions, truncated: Boolean(data.next) };
    },
  };
}
export type PosthogApi = ReturnType<typeof createPosthogApi>;
