import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestInputSchema, workRequestSchema } from "./schema";
import { createRequest, listRequests } from "./store";

vi.mock("next/cache", () => ({ io: vi.fn().mockResolvedValue(undefined) }));

beforeEach(() => {
  vi.stubGlobal("workbotRequests", []);
});

describe("requests model", () => {
  it("trims text and applies defaults", async () => {
    const request = await createRequest({
      title: "  Relatório mensal  ",
      details: "  Contexto  ",
    });
    expect(request).toMatchObject({
      title: "Relatório mensal",
      details: "Contexto",
      team: "operations",
      priority: "medium",
      status: "new",
    });
    expect(workRequestSchema.safeParse(request).success).toBe(true);
  });

  it("defaults optional details to an empty string", async () => {
    expect(await createRequest({ title: "Novo acesso" })).toMatchObject({
      details: "",
    });
  });

  it.each([
    { title: "  " },
    { title: "ab" },
    { title: "a".repeat(121) },
    { title: "Novo acesso", details: "a".repeat(5001) },
    { title: "Novo acesso", details: 5 },
    { title: "Novo acesso", team: "unknown" },
    { title: "Novo acesso", priority: "urgent" },
    { title: "Novo acesso", status: "completed" },
    { title: "Novo acesso", id: "caller-id" },
  ])("rejects invalid input without creating a request: %j", async (input) => {
    await expect(createRequest(input)).rejects.toThrow();
    expect(await listRequests()).toEqual([]);
  });

  it("accepts every declared team and priority", () => {
    for (const team of ["operations", "finance", "support"]) {
      for (const priority of ["low", "medium", "high"]) {
        expect(
          requestInputSchema.safeParse({ title: "Novo acesso", team, priority })
            .success,
        ).toBe(true);
      }
    }
  });

  it("generates distinct server IDs and valid timestamps", async () => {
    const before = Date.now();
    const first = await createRequest({ title: "Primeira solicitação" });
    const second = await createRequest({ title: "Segunda solicitação" });
    expect(first.id).not.toBe(second.id);
    expect(Date.parse(first.createdAt)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(first.createdAt)).toBeLessThanOrEqual(Date.now());
  });

  it("lists newest first, including identical timestamps", async () => {
    const first = await createRequest({ title: "Primeira solicitação" });
    const second = await createRequest({ title: "Segunda solicitação" });
    expect((await listRequests()).map((request) => request.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it("does not expose mutable references to the store", async () => {
    const created = await createRequest({ title: "Título original" });
    created.title = "Alterado pelo consumidor";
    const list = await listRequests();
    list[0].title = "Outra alteração";
    list.pop();
    expect(await listRequests()).toMatchObject([{ title: "Título original" }]);
  });
});
