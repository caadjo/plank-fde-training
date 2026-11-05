import "@/testing/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { track } from "@/lib/analytics";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { listRequests } from "@/lib/requests/store";
import { submitRequest } from "./actions";
import { initialRequestFormState } from "./form-state";
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

vi.mock("next/cache", () => ({
  io: vi.fn().mockResolvedValue(undefined),
  revalidatePath: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error("REDIRECT:" + url);
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("submitRequest", () => {
  it("returns field errors and preserves the entered values without a mutation", async () => {
    const form = new FormData();
    form.set("title", "  ");
    form.set("details", "Contexto preenchido");
    form.set("team", "finance");
    const result = await submitRequest(initialRequestFormState, form);
    expect(result.errors.title).toBeDefined();
    expect(result.values).toMatchObject({
      details: "Contexto preenchido",
      team: "finance",
    });
    expect(await listRequests()).toEqual([]);
    expect(redirect).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("creates a valid request, invalidates the views and redirects", async () => {
    const form = new FormData();
    form.set("title", "  Relatório mensal  ");
    form.set("team", "support");
    form.set("priority", "high");
    await expect(submitRequest(initialRequestFormState, form)).rejects.toThrow(
      "REDIRECT:/requests",
    );
    expect(await listRequests()).toMatchObject([
      {
        title: "Relatório mensal",
        team: "support",
        priority: "high",
        status: "new",
      },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/requests");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(redirect).toHaveBeenCalledWith("/requests");
    expect(track).toHaveBeenCalledWith("request_submitted", {
      requestId: expect.any(String),
      team: "support",
    });
  });

  it("rejects unexpected file values instead of converting them to text", async () => {
    const form = new FormData();
    form.set("title", new File(["content"], "payload.txt"));
    const result = await submitRequest(initialRequestFormState, form);
    expect(result.errors.title).toBeDefined();
    expect(result.values.title).toBe("");
    expect(await listRequests()).toEqual([]);
  });
});
