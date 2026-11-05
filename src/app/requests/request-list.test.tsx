import "@/testing/database";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RequestList } from "./request-list";
import { createRequest } from "@/lib/requests/store";

vi.mock("next/cache", () => ({ io: vi.fn().mockResolvedValue(undefined) }));

async function render(
  params: Record<string, string | string[] | undefined> = {},
) {
  return renderToStaticMarkup(
    await RequestList({ searchParams: Promise.resolve(params) }),
  );
}

describe("request list page content", () => {
  it("renders only matching requests in descending order", async () => {
    await createRequest({ title: "Finanças antiga", team: "finance" });
    await createRequest({ title: "Suporte excluído", team: "support" });
    await createRequest({ title: "Finanças recente", team: "finance" });
    const html = await render({ team: "finance", status: "new" });
    expect(html).not.toContain("Suporte excluído");
    expect(html.indexOf("Finanças recente")).toBeLessThan(
      html.indexOf("Finanças antiga"),
    );
    expect(await render()).toContain("Suporte excluído");
  });

  it("provides named filter navigation, selected states and links preserving the other filter", async () => {
    const html = await render({ team: "finance", status: "new" });
    expect(html).toContain('aria-label="Filtrar por equipe"');
    expect(html).toContain('aria-label="Filtrar por status"');
    expect(html).toMatch(
      /<a(?=[^>]*href="\/requests\?team=finance&amp;status=new")(?=[^>]*aria-current="true")[^>]*>/,
    );
    for (const href of [
      "team=support&amp;status=new",
      "team=finance&amp;status=completed",
      "status=new",
      "team=finance",
    ])
      expect(html).toContain(`href="/requests?${href}"`);
    expect(html).toMatch(/href="\/requests"[^>]*>Limpar filtros<\/a>/);
    expect(html).toContain("Nenhuma solicitação encontrada");
    expect(html).not.toContain("Criar primeira solicitação");
  });

  it("ignores invalid and repeated parameters while keeping the valid filter", async () => {
    await createRequest({ title: "Pedido financeiro", team: "finance" });
    await createRequest({ title: "Pedido de suporte", team: "support" });
    const html = await render({
      team: "finance",
      status: ["new", "completed"],
    });
    expect(html).toContain("Pedido financeiro");
    expect(html).not.toContain("Pedido de suporte");
    expect(html).toMatch(
      /<a(?=[^>]*href="\/requests\?team=finance")(?=[^>]*aria-current="true")[^>]*>Todos os status<\/a>/,
    );
    for (const team of ["invalid", ["finance", "support"]]) {
      const unfiltered = await render({ team, status: "invalid" });
      expect(unfiltered).toContain("Pedido financeiro");
      expect(unfiltered).toContain("Pedido de suporte");
      expect(unfiltered).not.toContain("Limpar filtros");
    }
  });

  it("preserves the original empty state when no filters apply", async () => {
    expect(await render()).toContain("Criar primeira solicitação");
  });
});
