import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/site-header";

describe("SiteHeader", () => {
  it("exibe a marca WorkBot", () => {
    expect(renderToStaticMarkup(<SiteHeader />)).toContain(">WorkBot</span>");
  });
  it("oferece um link para a página inicial", () => {
    const markup = renderToStaticMarkup(<SiteHeader />);
    expect(markup).toMatch(/<a\b[^>]*href="\/"[^>]*>/);
    expect(markup).toContain('aria-label="WorkBot — início"');
  });
  it("oferece solicitações e configurações na navegação principal", () => {
    const markup = renderToStaticMarkup(<SiteHeader />);
    const navigation = markup.match(
      /<nav\b[^>]*aria-label="Navegação principal"[^>]*>(.*?)<\/nav>/,
    )?.[1];
    expect(navigation).toBeDefined();
    expect(navigation).toContain('href="/requests"');
    expect(navigation).toContain('href="/settings"');
  });
});
