import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import postgres from "postgres";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { serverConfig } from "../src/lib/config";
import { openDatabase } from "../src/lib/db";

/** Local-only smoke check; creates and deletes exactly one fictitious request. */
async function main() {
  loadEnvConfig(resolve(process.argv[2] || "."), true, {
    info: () => {},
    error: () => {},
  });
  assert.ok(
    serverConfig.databaseUrl.startsWith("postgres"),
    "Configure local DATABASE_URL first.",
  );
  assert.ok(
    serverConfig.readOnlyDatabaseUrl,
    "Configure DATABASE_READONLY_URL first.",
  );
  const id = randomUUID();
  let db = await openDatabase(serverConfig.databaseUrl);
  const reader = await openDatabase(serverConfig.readOnlyDatabaseUrl, {
    readOnly: true,
  });
  const client = new Client({ name: "workbot-smoke", version: "1.0.0" });
  try {
    await db.query(
      "INSERT INTO requests (id,title,team,priority) VALUES ($1,$2,'finance','high')",
      [id, "Verificação local Dia 5"],
    );
    await assert.rejects(db.query("SELECT 1; SELECT 2"));
    await db.close();
    db = await openDatabase(serverConfig.databaseUrl);
    assert.equal(
      (await db.query("SELECT title FROM requests WHERE id=$1", [id]))[0].title,
      "Verificação local Dia 5",
    );
    console.log(
      "PostgreSQL: schema, parameters and persistence across reconnect passed.",
    );

    for (const text of [
      `DELETE FROM requests WHERE id = '${id}'`,
      `SELECT 1; DELETE FROM requests WHERE id = '${id}'`,
      `WITH changed AS (DELETE FROM requests RETURNING *) SELECT * FROM changed`,
      "SET TRANSACTION READ WRITE",
      "SELECT set_config('transaction_read_only','off',true)",
      "SELECT set_config('role','workbot_day5_app',true)",
    ])
      await assert.rejects(
        reader.query(text),
        `Read-only guard accepted: ${text}`,
      );
    assert.equal(
      (await reader.query("SELECT generate_series(1,150) AS n")).length,
      100,
    );
    const unwrapped = postgres(serverConfig.readOnlyDatabaseUrl, {
      onnotice: () => {},
    });
    try {
      await unwrapped.unsafe("SET default_transaction_read_only = off");
      await assert.rejects(
        unwrapped.unsafe("DELETE FROM requests WHERE id = $1", [id]),
      );
    } finally {
      await unwrapped.end();
    }
    console.log(
      "Read-only SQL: writes, multiple statements and privilege changes rejected; 100-row limit passed.",
    );

    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["node_modules/tsx/dist/cli.mjs", "mcp/database.ts"],
      env: {
        ...getDefaultEnvironment(),
        DATABASE_READONLY_URL: serverConfig.readOnlyDatabaseUrl,
      },
      stderr: "pipe",
    });
    await client.connect(transport);
    assert.equal((await client.listTools()).tools.length, 3);
    for (const [name, args] of [
      ["query", { sql: `SELECT team, count(*) FROM requests GROUP BY team` }],
      ["schema", {}],
      ["describe-table", { table: "requests" }],
    ] as const) {
      const response = await client.callTool({ name, arguments: args });
      assert.notEqual(response.isError, true, `Tool ${name} failed.`);
    }
    const resource = await client.readResource({ uri: "db://tables" });
    assert.ok(JSON.stringify(resource).includes("requests"));
    assert.equal(
      (
        await client.callTool({
          name: "query",
          arguments: { sql: "DELETE FROM requests" },
        })
      ).isError,
      true,
    );
    assert.equal(
      (
        await db.query(
          "SELECT count(*)::int AS count FROM requests WHERE id=$1",
          [id],
        )
      )[0].count,
      1,
    );
    console.log(
      "Database MCP: real stdio handshake, all tools, resource and rejected write passed.",
    );
    const privilegedClient = new Client({
      name: "workbot-privilege-test",
      version: "1.0.0",
    });
    try {
      await assert.rejects(
        privilegedClient.connect(
          new StdioClientTransport({
            command: process.execPath,
            args: ["node_modules/tsx/dist/cli.mjs", "mcp/database.ts"],
            env: {
              ...getDefaultEnvironment(),
              DATABASE_READONLY_URL: serverConfig.databaseUrl,
            },
            stderr: "pipe",
          }),
        ),
      );
    } finally {
      await privilegedClient.close();
    }
    console.log(
      "Database MCP: a write-capable app role was refused at startup.",
    );
  } finally {
    await client.close();
    await reader.close();
    await db.query("DELETE FROM requests WHERE id=$1", [id]);
    await db.close();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Smoke check failed.");
  process.exitCode = 1;
});
