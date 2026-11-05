import "@/testing/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as store from "@/lib/requests/store";
import { GET, POST } from "./route";
import {
  createRequestResponseSchema,
  listRequestsResponseSchema,
  requestErrorResponseSchema,
} from "./types";

vi.mock("next/cache", () => ({ io: vi.fn().mockResolvedValue(undefined) }));
beforeEach(() => {
  vi.restoreAllMocks();
});

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("/api/requests", () => {
  it("returns an empty list conforming to the response schema", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(listRequestsResponseSchema.parse(await response.json())).toEqual({
      requests: [],
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("creates a request with normalized text and defaults", async () => {
    const response = await post({ title: "  Relatório mensal  " });
    expect(response.status).toBe(201);
    const body = createRequestResponseSchema.parse(await response.json());
    expect(body.request).toMatchObject({
      title: "Relatório mensal",
      details: "",
      priority: "medium",
      team: "operations",
      status: "new",
    });
  });

  it("lists created requests newest first", async () => {
    await post({ title: "Primeira solicitação" });
    await post({ title: "Segunda solicitação" });
    const response = await GET();
    const body = listRequestsResponseSchema.parse(await response.json());
    expect(body.requests.map((request) => request.title)).toEqual([
      "Segunda solicitação",
      "Primeira solicitação",
    ]);
  });

  it("separates malformed JSON from schema validation errors", async () => {
    const response = await POST(
      new Request("http://localhost/api/requests", {
        method: "POST",
        body: "{",
      }),
    );
    expect(response.status).toBe(400);
    expect(requestErrorResponseSchema.parse(await response.json())).toEqual({
      error: "JSON malformado.",
    });
  });

  it.each([
    { title: "" },
    { title: "Novo acesso", team: "unknown" },
    { title: "Novo acesso", priority: "urgent" },
    { title: "Novo acesso", status: "completed" },
    null,
  ])("rejects invalid data with structured issues: %j", async (input) => {
    const response = await post(input);
    expect(response.status).toBe(400);
    const body = requestErrorResponseSchema.parse(await response.json());
    expect(body.issues?.length).toBeGreaterThan(0);
    expect((await store.listRequests()).length).toBe(0);
  });

  it("does not return submitted values in validation issues", async () => {
    const secret = "PRIVATE-VALUE-DO-NOT-ECHO";
    const response = await post({ title: "Novo acesso", team: secret });
    const body = requestErrorResponseSchema.parse(await response.json());
    expect(JSON.stringify(body)).not.toContain(secret);
    expect(body.issues?.[0].path).toEqual(["team"]);
    expect(body.issues?.[0]).not.toHaveProperty("input");
  });

  it("propagates internal failures instead of responding with a validation error", async () => {
    vi.spyOn(store, "createRequest").mockRejectedValueOnce(
      new Error("Internal failure"),
    );
    await expect(post({ title: "Novo acesso" })).rejects.toThrow(
      "Internal failure",
    );
  });
});
