import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PolicyBody } from "@/components/policy-body";

describe("PolicyBody", () => {
  it("renderiza Markdown sem executar HTML cru ou URLs perigosas", () => {
    const markup = renderToStaticMarkup(
      <PolicyBody
        content={
          "## Exemplo\n\n**Texto**\n\n<script>alert(1)</script>\n\n[Link](javascript:alert)"
        }
      />,
    );
    expect(markup).toContain("<h2>Exemplo</h2>");
    expect(markup).toContain("<strong>Texto</strong>");
    expect(markup).toContain("prose");
    expect(markup).not.toContain("<script");
    expect(markup).not.toContain("javascript:");
  });
});
