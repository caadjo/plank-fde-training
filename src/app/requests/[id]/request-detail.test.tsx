import { Suspense } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequest } from "@/lib/requests/store";
import RequestDetailPage from "./page";
import { RequestDetail } from "./request-detail";

vi.mock("next/cache", () => ({ io: vi.fn().mockResolvedValue(undefined) }));

beforeEach(() => {
  vi.stubGlobal("workbotRequests", []);
});

describe("request detail", () => {
  it("renders the requested record with semantic fields and escaped multiline details", async () => {
    const request = await createRequest({
      title: "Relatório mensal",
      details: "Primeira linha\n<script>alert(1)</script>",
      team: "finance",
      priority: "high",
    });
    const html = renderToStaticMarkup(
      await RequestDetail({ params: Promise.resolve({ id: request.id }) }),
    );
    for (const text of [
      ">Relatório mensal</h1>",
      "<dt",
      "Equipe",
      "Finanças",
      "Prioridade",
      "Alta",
      "Status",
      "Nova",
      "Criada em",
      `dateTime="${request.createdAt}"`,
      "Detalhes",
      "Primeira linha\n&lt;script&gt;",
      "whitespace-pre-wrap",
    ])
      expect(html).toContain(text);
    const details = html.match(
      /<section[^>]*aria-labelledby="request-details"[^>]*>([\s\S]*?)<\/section>/,
    )?.[1];
    expect(details).toBeDefined();
    expect(details).not.toContain("<script>");
    expect(html).toContain('aria-label="Atualizar status da solicitação"');
    expect(html).toContain("Alterar status");
  });

  it("explains when optional details are empty", async () => {
    const request = await createRequest({ title: "Novo acesso" });
    const html = renderToStaticMarkup(
      await RequestDetail({ params: Promise.resolve({ id: request.id }) }),
    );
    expect(html).toContain("Nenhum detalhe informado.");
  });

  it.each(["unknown", "00000000-0000-4000-8000-000000000000"])(
    "invokes the Next.js 404 boundary for an unknown ID: %s",
    async (id) => {
      await expect(
        RequestDetail({ params: Promise.resolve({ id }) }),
      ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    },
  );

  it("keeps async params and the store read under Suspense with a loading status", () => {
    const params = new Promise<{ id: string }>(() => {});
    const page = RequestDetailPage({ params });
    const boundary = page.props.children[1];
    expect(boundary.type).toBe(Suspense);
    expect(boundary.props.children.props.params).toBe(params);
    const html = renderToStaticMarkup(page);
    expect(html).toContain('href="/requests"');
    expect(html).toContain('role="status"');
    expect(html).toContain("Carregando solicitação…");
  });
});
