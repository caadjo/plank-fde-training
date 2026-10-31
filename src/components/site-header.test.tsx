import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/site-header";

describe("SiteHeader", () => {
  it("exibe a marca WorkBot", () => {
    const markup = renderToStaticMarkup(<SiteHeader />);

    expect(markup).toContain(">WorkBot</span>");
  });

  it("oferece um link para a página inicial", () => {
    const markup = renderToStaticMarkup(<SiteHeader />);

    expect(markup).toMatch(/<a\b[^>]*href="\/"[^>]*>/);
    expect(markup).toContain('aria-label="WorkBot — início"');
  });

  it("oferece um link para as configurações na navegação principal", () => {
    const markup = renderToStaticMarkup(<SiteHeader />);

    expect(markup).toMatch(
      /<nav aria-label="Navegação principal"><a\b[^>]*href="\/settings"[^>]*>Configurações<\/a><\/nav>/,
    );
  });
});
