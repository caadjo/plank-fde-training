import { describe, expect, it, vi } from "vitest";
import { config } from "@/lib/config";
import { GET } from "./route";
import { healthResponseSchema } from "./types";
import { query } from "@/lib/db";

const { connection } = vi.hoisted(() => ({ connection: vi.fn() }));
vi.mock("next/server", () => ({ connection }));
vi.mock("@/lib/db", () => ({
  query: vi.fn().mockResolvedValue([{ healthy: 1 }]),
}));

describe("GET /api/health", () => {
  it("waits for a server connection before returning the health response", async () => {
    let connect!: () => void;
    connection.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        connect = resolve;
      }),
    );
    let responded = false;
    const pending = GET().then((response) => {
      responded = true;
      return response;
    });
    await Promise.resolve();
    expect(responded).toBe(false);
    connect();
    const response = await pending;
    expect(response.status).toBe(200);
    expect(healthResponseSchema.parse(await response.json())).toEqual({
      status: "ok",
      database: "ok",
      commit: config.commit,
    });
  });

  it("returns 503 without leaking database credentials on failure", async () => {
    vi.mocked(query).mockRejectedValueOnce(
      new Error("postgres://secret-password@host"),
    );
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(healthResponseSchema.parse(await response.json())).toEqual({
      status: "error",
      database: "unavailable",
      commit: config.commit,
    });
  });

  it("propagates a connection failure instead of reporting a healthy server", async () => {
    const error = new Error("Connection unavailable");
    connection.mockRejectedValueOnce(error);
    await expect(GET()).rejects.toBe(error);
  });
});
