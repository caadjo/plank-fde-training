import { describe, expect, it, vi } from "vitest";
import { config } from "@/lib/config";
import { GET } from "./route";

const { connection } = vi.hoisted(() => ({ connection: vi.fn() }));
vi.mock("next/server", () => ({ connection }));

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
    expect(await response.json()).toEqual({
      status: "ok",
      commit: config.commit,
    });
  });

  it("propagates a connection failure instead of reporting a healthy server", async () => {
    const error = new Error("Connection unavailable");
    connection.mockRejectedValueOnce(error);
    await expect(GET()).rejects.toBe(error);
  });
});
