import { resolve } from "node:path";
import { serverConfig } from "./config";
import { schema } from "./schema";

export type Row = Record<string, unknown>;
export type Query = (text: string, params?: unknown[]) => Promise<Row[]>;
export type Database = { query: Query; close: () => Promise<void> };

/** A SELECT subquery cannot contain transaction control or multiple statements. */
function readQuery(text: string) {
  return `SELECT * FROM (${text.trim().replace(/;$/, "")}) AS workbot_read LIMIT 100`;
}

export async function openDatabase(
  url = "",
  { readOnly = false }: { readOnly?: boolean } = {},
): Promise<Database> {
  let database: Database;
  let initialize: () => Promise<void>;
  if (/^postgres(ql)?:\/\//.test(url)) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, {
      max: 5,
      connect_timeout: 5,
      idle_timeout: 20,
      onnotice: () => {},
      connection: { statement_timeout: 5000, application_name: "workbot" },
    });
    database = {
      query: async (text, params = []) => {
        if (!readOnly)
          return Array.from(
            await sql.unsafe(text, params as never[], {
              prepare: true,
              simple: false,
            }),
          );
        return sql.begin("read only", async (tx) =>
          Array.from(
            await tx.unsafe(readQuery(text), params as never[], {
              prepare: true,
              simple: false,
            }),
          ),
        ) as Promise<Row[]>;
      },
      close: () => sql.end({ timeout: 5 }),
    };
    initialize = async () => {
      await sql.begin(async (tx) => {
        // Serialize cold-start schema creation across application instances.
        await tx`SELECT pg_advisory_xact_lock(174605, 5)`;
        for (const statement of schema) {
          await tx.unsafe(statement, [], { prepare: true, simple: false });
        }
      });
    };
  } else {
    if (url && url !== "memory://" && !url.startsWith("file://")) {
      throw new Error(
        "DATABASE_URL must use postgres://, postgresql://, file:// or memory://.",
      );
    }
    if (readOnly) {
      throw new Error(
        "The database MCP requires a PostgreSQL read-only connection.",
      );
    }
    const { PGlite } = await import("@electric-sql/pglite");
    const pg = await PGlite.create(
      url === "memory://" ? "memory://" : url || resolve(".data/pg"),
    );
    database = {
      query: async (text, params = []) =>
        (await pg.query<Row>(text, params)).rows,
      close: () => pg.close(),
    };
    initialize = async () => {
      for (const statement of schema) await database.query(statement);
    };
  }
  try {
    if (!readOnly) await initialize();
    return database;
  } catch (error) {
    await database.close();
    throw error;
  }
}

const databaseGlobal = globalThis as typeof globalThis & {
  workbotDatabase?: Promise<Database>;
};

function database() {
  if (!databaseGlobal.workbotDatabase) {
    const url = serverConfig.databaseUrl;
    if (serverConfig.hosted && !/^postgres(ql)?:\/\//.test(url)) {
      throw new Error(
        "A PostgreSQL DATABASE_URL is required on hosted deployments.",
      );
    }
    databaseGlobal.workbotDatabase = openDatabase(url).catch((error) => {
      delete databaseGlobal.workbotDatabase;
      throw error;
    });
  }
  return databaseGlobal.workbotDatabase;
}

export const query: Query = async (text, params) =>
  (await database()).query(text, params);

/** Also used for graceful shutdown and isolated database tests. */
export async function closeDatabase() {
  const pending = databaseGlobal.workbotDatabase;
  delete databaseGlobal.workbotDatabase;
  if (pending) await (await pending).close();
}
