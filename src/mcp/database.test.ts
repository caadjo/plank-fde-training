import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { openDatabase, type Database } from "../lib/db";
import { databaseServer } from "./database";

describe("database MCP protocol", () => {
  let db: Database;
  let client: Client;
  let server: ReturnType<typeof databaseServer>;
  beforeAll(async () => {
    db = await openDatabase("memory://");
    await db.query(
      `INSERT INTO requests (id,title,team,priority) VALUES ($1,'Teste MCP','finance','high')`,
      [crypto.randomUUID()],
    );
    server = databaseServer(db.query);
    client = new Client({ name: "workbot-test", version: "1.0.0" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });
  afterAll(async () => {
    await client?.close();
    await server?.close();
    await db?.close();
  });

  it("advertises three read-only tools and the tables resource", async () => {
    expect((await client.listTools()).tools.map((tool) => tool.name)).toEqual([
      "query",
      "schema",
      "describe-table",
    ]);
    expect(
      (await client.listTools()).tools.every(
        (tool) => tool.annotations?.readOnlyHint,
      ),
    ).toBe(true);
    expect((await client.listResources()).resources[0].uri).toBe("db://tables");
    const resource = await client.readResource({ uri: "db://tables" });
    expect(resource.contents[0]).toMatchObject({
      text: expect.stringContaining("requests"),
    });
  });
  it("queries real rows and limits tool output", async () => {
    const response = await client.callTool({
      name: "query",
      arguments: { sql: "SELECT title FROM requests" },
    });
    expect(response.isError).not.toBe(true);
    expect(JSON.stringify(response.content)).toContain("Teste MCP");
    const limited = await client.callTool({
      name: "query",
      arguments: { sql: "SELECT generate_series(1,150) AS n" },
    });
    expect(
      JSON.parse((limited.content as { text: string }[])[0].text).rows,
    ).toHaveLength(100);
  });
  it("reads columns, constraints, counts and sample rows", async () => {
    const schema = await client.callTool({ name: "schema", arguments: {} });
    expect(schema.isError).not.toBe(true);
    expect(JSON.stringify(schema.content)).toContain("PRIMARY KEY");
    const table = await client.callTool({
      name: "describe-table",
      arguments: { table: "requests" },
    });
    const parsed = JSON.parse((table.content as { text: string }[])[0].text);
    expect(parsed.rowCount).toBe("1");
    expect(parsed.sampleRows).toHaveLength(1);
    expect(
      parsed.columns.map(
        (column: { column_name: string }) => column.column_name,
      ),
    ).toContain("status");
  });
  it("rejects unsafe identifiers and reports unknown tables without raw errors", async () => {
    for (const table of ["requests; DROP TABLE requests", "missing_table"]) {
      const response = await client.callTool({
        name: "describe-table",
        arguments: { table },
      });
      expect(response.isError).toBe(true);
    }
    expect(
      (await db.query("SELECT count(*)::int AS count FROM requests"))[0].count,
    ).toBe(1);
  });
});
