import { beforeEach, describe, expect, it, vi } from "vitest";
import { io } from "next/cache";
import { requestInputSchema, workRequestSchema } from "./schema";
import { createRequest, getRequest, listRequests } from "./store";

vi.mock("next/cache", () => ({ io: vi.fn().mockResolvedValue(undefined) }));

beforeEach(() => {
  vi.stubGlobal("workbotRequests", []);
});

describe("requests model", () => {
  it("finds only the requested ID and returns defensive copies", async () => {
    await createRequest({ title: "Outra solicitação" });
    const created = await createRequest({ title: "Título original" });
    const found = await getRequest(created.id);
    expect(found).toEqual(created);
    expect(found).not.toBe(created);
    found!.title = "Alteração externa";
    expect(await getRequest(created.id)).toEqual(created);
  });

  it.each(["", "unknown", "00000000-0000-4000-8000-000000000000"])(
    "returns undefined for an unknown ID: %s",
    async (id) => {
      await createRequest({ title: "Solicitação existente" });
      expect(await getRequest(id)).toBeUndefined();
    },
  );

  it("waits for io before reading the store", async () => {
    let resume!: () => void;
    vi.mocked(io).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resume = resolve;
        }),
    );
    const pending = getRequest("late-id");
    const created = await createRequest({ title: "Criada durante a espera" });
    vi.stubGlobal("workbotRequests", [{ ...created, id: "late-id" }]);
    resume();
    expect(await pending).toMatchObject({ id: "late-id" });
  });

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
