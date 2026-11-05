import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminNav } from "./admin-nav";
vi.mock("next/navigation", () => ({ usePathname: () => "/admin" }));

describe("AdminNav", () => {
  it("identifies the current page and offers the settings link", () => {
    const html = renderToStaticMarkup(<AdminNav />);
    expect(html).toContain('aria-label="Administração"');
    const currentLink = html.match(/<a\b(?=[^>]*href="\/admin")[^>]*>/)?.[0];
    expect(currentLink).toContain('aria-current="page"');
    expect(html).toContain('href="/settings"');
  });
});
