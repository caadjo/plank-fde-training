import { loadEnvConfig } from "@next/env";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { serverConfig } from "../src/lib/config";
import { createPosthogApi } from "../src/mcp/posthog-api";
import { posthogServer } from "../src/mcp/posthog";

loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

async function main() {
  const api = createPosthogApi({
    host: serverConfig.posthogApiHost,
    projectId: serverConfig.posthogProjectId,
    key: serverConfig.posthogPersonalKey,
  });
  const server = posthogServer(api);
  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  process.stdin.once("end", shutdown);
  await server.connect(new StdioServerTransport());
}
main().catch(() => {
  console.error(
    "PostHog MCP could not start. Check the project ID, API host and personal read key.",
  );
  process.exitCode = 1;
});
