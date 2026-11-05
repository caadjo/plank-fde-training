import "@/testing/database";
import { describe, expect, it, vi } from "vitest";
import { query } from "@/lib/db";
import * as database from "@/lib/db";
import { io } from "next/cache";
import { requestInputSchema, workRequestSchema } from "./schema";
import {
  createRequest,
  getRequest,
  listRequests,
  updateRequestStatus,
} from "./store";

vi.mock("next/cache", () => ({ io: vi.fn().mockResolvedValue(undefined) }));

describe("requests model", () => {
  it("validates database rows against the shared model before returning them", async () => {
    const spy = vi.spyOn(database, "query").mockResolvedValueOnce([
      {
        id: "a76ab7ee-9653-471c-b042-a9c3fe0411f1",
        title: "Linha incompatível",
        details: "",
        team: "finance",
        priority: "high",
        status: "unsupported",
        created_at: new Date(),
      },
    ]);
    try {
      await expect(
        getRequest("a76ab7ee-9653-471c-b042-a9c3fe0411f1"),
      ).rejects.toThrow();
    } finally {
      spy.mockRestore();
    }
  });
  it("shares status updates across detail reads and combined filters", async () => {
    const request = await createRequest({
      title: "Integração Dia 4",
      team: "finance",
    });
    await updateRequestStatus(request.id, "completed");
    expect(await getRequest(request.id)).toEqual({
      ...request,
      status: "completed",
    });
    expect(await listRequests({ team: "finance", status: "new" })).toEqual([]);
    expect(
      await listRequests({ team: "finance", status: "completed" }),
    ).toEqual([{ ...request, status: "completed" }]);
  });

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
    const id = "a76ab7ee-9653-471c-b042-a9c3fe0411f1";
    const pending = getRequest(id);
    const created = await createRequest({ title: "Criada durante a espera" });
    await query("UPDATE requests SET id = $1 WHERE id = $2", [id, created.id]);
    resume();
    expect(await pending).toMatchObject({ id });
  });

  it("updates every shared status, preserves fields and returns defensive copies", async () => {
    const original = await createRequest({ title: "Atualizar acesso" });
    for (const status of workRequestSchema.shape.status.options) {
      const updated = await updateRequestStatus(original.id, status);
      expect(updated).toEqual({ ...original, status });
      updated!.title = "Mutação externa";
      expect(await listRequests()).toEqual([{ ...original, status }]);
    }
  });

  it("does not insert missing IDs", async () => {
    expect(
      await updateRequestStatus(
        "c0b91ad0-04c6-4e2a-8a78-fcda241411ac",
        "completed",
      ),
    ).toBeNull();
    expect(await listRequests()).toEqual([]);
  });

  it.each(["invalid", "", null, undefined, 1, {}, ["completed"]])(
    "rejects an untrusted status before writing: %j",
    async (status) => {
      const original = await createRequest({ title: "Atualizar acesso" });
      await expect(updateRequestStatus(original.id, status)).rejects.toThrow();
      expect(await listRequests()).toEqual([original]);
    },
  );

  it("rejects an invalid ID without changing the store", async () => {
    const original = await createRequest({ title: "Atualizar acesso" });
    await expect(updateRequestStatus({}, "completed")).rejects.toThrow();
    expect(await listRequests()).toEqual([original]);
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

  it("filters by team, status or both without changing the full list or order", async () => {
    const first = await createRequest({
      title: "Finanças antiga",
      team: "finance",
    });
    const second = await createRequest({
      title: "Pedido de suporte",
      team: "support",
    });
    const third = await createRequest({
      title: "Finanças recente",
      team: "finance",
    });
    await updateRequestStatus(second.id, "completed");
    expect((await listRequests({ team: "finance" })).map((r) => r.id)).toEqual([
      third.id,
      first.id,
    ]);
    expect(
      (await listRequests({ status: "completed" })).map((r) => r.id),
    ).toEqual([second.id]);
    expect(
      (await listRequests({ team: "finance", status: "new" })).map((r) => r.id),
    ).toEqual([third.id, first.id]);
    expect(
      await listRequests({ team: "finance", status: "completed" }),
    ).toEqual([]);
    expect((await listRequests()).map((r) => r.id)).toEqual([
      third.id,
      second.id,
      first.id,
    ]);
    const filtered = await listRequests({ team: "finance" });
    filtered[0].title = "Alterado";
    expect((await listRequests())[0].title).toBe(third.title);
  });
});
