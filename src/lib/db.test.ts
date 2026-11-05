import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { openDatabase } from "./db";

describe("database adapters", () => {
  it("persists rows across connection restarts and safely reapplies the schema", async () => {
    const directory = await mkdtemp(join(tmpdir(), "workbot-persistence-"));
    const url = pathToFileURL(join(directory, "pg")).href;
    try {
      const db = await openDatabase(url);
      try {
        await db.query(
          `INSERT INTO requests (id,title,team,priority) VALUES ($1,$2,$3,$4)`,
          [
            "c0b91ad0-04c6-4e2a-8a78-fcda241411ac",
            "Persiste após reinício",
            "finance",
            "high",
          ],
        );
        await expect(
          db.query("SELECT $1::text AS value", ["'; DROP TABLE requests; --"]),
        ).resolves.toEqual([{ value: "'; DROP TABLE requests; --" }]);
        await expect(db.query("SELECT 1; SELECT 2")).rejects.toThrow();
      } finally {
        await db.close();
      }
      const restarted = await openDatabase(url);
      try {
        expect(await restarted.query("SELECT title FROM requests")).toEqual([
          { title: "Persiste após reinício" },
        ]);
      } finally {
        await restarted.close();
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("enforces database constraints on direct writes", async () => {
    const db = await openDatabase("memory://");
    try {
      await expect(
        db.query(
          `INSERT INTO requests (id,title,team,priority,status)
        VALUES ($1,'Valido','finance','high','invalid')`,
          [crypto.randomUUID()],
        ),
      ).rejects.toThrow();
    } finally {
      await db.close();
    }
  });

  it("rejects unknown database schemes instead of silently opening a different database", async () => {
    await expect(openDatabase("mysql://localhost/workbot")).rejects.toThrow(
      "DATABASE_URL",
    );
    await expect(openDatabase("memory://", { readOnly: true })).rejects.toThrow(
      "PostgreSQL",
    );
  });
});
