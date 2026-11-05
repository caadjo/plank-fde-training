import assert from "node:assert/strict";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { serverConfig } from "../src/lib/config";

async function main() {
  loadEnvConfig(resolve(process.argv[2] || "."), true, {
    info: () => {},
    error: () => {},
  });
  assert.ok(
    serverConfig.posthogProjectId && serverConfig.posthogPersonalKey,
    "Configure the PostHog project and personal read key first.",
  );
  const client = new Client({ name: "workbot-funnel-smoke", version: "1.0.0" });
  try {
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: ["node_modules/tsx/dist/cli.mjs", "mcp/posthog.ts"],
        env: {
          ...getDefaultEnvironment(),
          POSTHOG_API_HOST: serverConfig.posthogApiHost,
          POSTHOG_PROJECT_ID: serverConfig.posthogProjectId,
          POSTHOG_PERSONAL_KEY: serverConfig.posthogPersonalKey,
        },
        stderr: "pipe",
      }),
    );
    assert.equal((await client.listTools()).tools.length, 3);
    async function call(name: string, args: Record<string, unknown>) {
      const response = await client.callTool({ name, arguments: args });
      assert.notEqual(response.isError, true, `Tool ${name} failed.`);
      return JSON.parse((response.content as { text: string }[])[0].text);
    }
    const expected = [
      "request_form_viewed",
      "request_submitted",
      "request_viewed",
      "request_status_changed",
    ];
    const definitions = await call("get-event-definitions", {});
    for (const event of expected) {
      assert.ok(
        definitions.definitions.some(
          (definition: { name: string }) => definition.name === event,
        ),
        `Missing definition: ${event}`,
      );
      assert.equal(
        (await call("check-event-fired", { event, minutes: 10 })).fired,
        true,
        `Missing recent event: ${event}`,
      );
      const data = await call("get-events", {
        event,
        after: new Date(Date.now() - 600000).toISOString(),
      });
      assert.ok(data.events.length, `No recent results: ${event}`);
      if (event !== "request_form_viewed") {
        assert.ok(
          data.events.every(
            (entry: { properties: Record<string, unknown> }) =>
              typeof entry.properties.requestId === "string" &&
              typeof entry.properties.team === "string",
          ),
          `Missing record properties: ${event}`,
        );
      }
      assert.ok(
        data.events.every((entry: { properties: Record<string, unknown> }) =>
          Object.keys(entry.properties).every((key) => !key.startsWith("$")),
        ),
        "Internal properties were exposed.",
      );
      console.log(`${event}: captured and read through the stdio MCP.`);
    }
  } finally {
    await client.close();
  }
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Analytics check failed.",
  );
  process.exitCode = 1;
});
