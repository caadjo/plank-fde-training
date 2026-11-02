import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RequestsTable } from "./requests-table";
import type { WorkRequest } from "@/lib/requests/schema";

const request: WorkRequest = {
  id: "c0b91ad0-04c6-4e2a-8a78-fcda241411ac",
  title: "Relatório mensal",
  details: "",
  team: "finance",
  priority: "high",
  status: "new",
  createdAt: "2026-11-02T12:00:00.000Z",
};

describe("RequestsTable", () => {
  it("offers a useful empty state and a link to the form", () => {
    const html = renderToStaticMarkup(<RequestsTable requests={[]} />);
    expect(html).toContain("Nenhuma solicitação por aqui");
    expect(html).toContain('href="/requests/new"');
  });
  it("renders the request with accessible headings and text labels", () => {
    const html = renderToStaticMarkup(<RequestsTable requests={[request]} />);
    for (const text of [
      "Relatório mensal",
      "Finanças",
      "Alta",
      "Nova",
      'scope="col"',
      'dateTime="2026-11-02T12:00:00.000Z"',
    ])
      expect(html).toContain(text);
  });
  it("escapes titles supplied by callers", () => {
    const html = renderToStaticMarkup(
      <RequestsTable
        requests={[{ ...request, title: "<script>alert(1)</script>" }]}
      />,
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
