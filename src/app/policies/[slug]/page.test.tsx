import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import PolicyPage, { generateStaticParams } from "./page";
import PoliciesPage from "../page";
import { getPolicy } from "@/lib/policies/store";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  },
}));

describe("rotas de políticas", () => {
  it("gera parâmetros e links para todo o corpus", async () => {
    const params = await generateStaticParams();
    expect(params).toHaveLength(8);
    const markup = renderToStaticMarkup(await PoliciesPage());
    for (const { slug } of params) {
      expect(markup).toContain(`href="/policies/${slug}"`);
      expect(
        renderToStaticMarkup(
          await PolicyPage({ params: Promise.resolve({ slug }) }),
        ),
      ).toContain("Exemplo fictício");
    }
  });
  it.each(["ausente", "../secret"])("devolve 404 para %s", async (slug) => {
    await expect(
      PolicyPage({ params: Promise.resolve({ slug }) }),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
  it("recusa slug inseguro na leitura em cache", async () => {
    await expect(getPolicy("../secret")).rejects.toThrow();
  });
});
