import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PosthogApi } from "./posthog-api";
import { safely, result } from "./result";

const annotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: true,
};
const eventName = z.string().trim().min(1).max(200);

export function posthogServer(api: PosthogApi) {
  const server = new McpServer({ name: "workbot-posthog", version: "1.0.0" });
  server.registerTool(
    "get-events",
    {
      description:
        "Read up to 100 events by name, anonymous visitor or time window. Internal $ properties and person profiles are omitted; truncated indicates more results exist.",
      inputSchema: {
        event: eventName.optional(),
        visitor: z.uuid().optional(),
        after: z.iso.datetime({ offset: true }).optional(),
        before: z.iso.datetime({ offset: true }).optional(),
      },
      annotations,
    },
    (filters) => {
      if (
        filters.after &&
        filters.before &&
        Date.parse(filters.after) > Date.parse(filters.before)
      ) {
        return {
          ...result({ error: "after must precede before." }),
          isError: true,
        };
      }
      return safely(() => api.events(filters));
    },
  );
  server.registerTool(
    "get-event-definitions",
    {
      description:
        "List observed event names and their last-seen timestamps. Follows pagination; truncated flags the safety limit.",
      inputSchema: {},
      annotations,
    },
    () => safely(() => api.definitions()),
  );
  server.registerTool(
    "check-event-fired",
    {
      description:
        "Check whether an event was captured in the last N minutes (1–1440).",
      inputSchema: {
        event: eventName,
        minutes: z.number().int().min(1).max(1440),
      },
      annotations,
    },
    ({ event, minutes }) =>
      safely(async () => {
        const before = new Date();
        const after = new Date(before.getTime() - minutes * 60000);
        const { events } = await api.events({
          event,
          after: after.toISOString(),
          before: before.toISOString(),
        });
        return {
          fired: events.length > 0,
          message: events.length
            ? `${event} was captured in the last ${minutes} minutes.`
            : `${event} was not captured in the last ${minutes} minutes.`,
        };
      }),
  );
  return server;
}
