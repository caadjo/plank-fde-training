import { loadEnvConfig } from "@next/env";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { serverConfig } from "../src/lib/config";
import { openDatabase } from "../src/lib/db";
import { databaseServer } from "../src/mcp/database";

loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

async function main() {
  const url = serverConfig.readOnlyDatabaseUrl;
  if (!url)
    throw new Error(
      "Configure DATABASE_READONLY_URL with a SELECT-only PostgreSQL role.",
    );
  const db = await openDatabase(url, { readOnly: true });
  try {
    const [permissions] = await db.query(`SELECT
      (r.rolsuper OR r.rolcreaterole OR r.rolcreatedb) AS privileged,
      has_schema_privilege(current_user, 'public', 'CREATE') AS can_create,
      has_table_privilege(current_user, 'public.requests', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') AS can_write
      FROM pg_roles r WHERE r.rolname = current_user`);
    if (
      !permissions ||
      permissions.privileged ||
      permissions.can_create ||
      permissions.can_write
    ) {
      throw new Error(
        "The MCP database role must have SELECT-only permissions.",
      );
    }
  } catch (error) {
    await db.close();
    throw error;
  }
  const server = databaseServer(db.query);
  const shutdown = async () => {
    await server.close();
    await db.close();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  process.stdin.once("end", shutdown);
  await server.connect(new StdioServerTransport());
}
main().catch(() => {
  console.error(
    "Database MCP could not start. Check DATABASE_READONLY_URL and permissions.",
  );
  process.exitCode = 1;
});
