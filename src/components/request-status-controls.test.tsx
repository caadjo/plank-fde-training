import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateRequestStatusAction } from "@/app/requests/status-actions";
import { requestStatuses, statusLabels } from "@/lib/requests/schema";
import { RequestStatusControls } from "./request-status-controls";

const state = vi.hoisted(() => ({ pending: false }));
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormStatus: () => ({ pending: state.pending }),
}));
vi.mock("@/app/requests/status-actions", () => ({
  updateRequestStatusAction: vi.fn(),
}));

beforeEach(() => {
  state.pending = false;
  vi.restoreAllMocks();
});

describe("RequestStatusControls", () => {
  it.each(requestStatuses)(
    "offers only other statuses from %s, in one form with bound actions",
    (status) => {
      const bind = vi.spyOn(
        updateRequestStatusAction as {
          bind: typeof updateRequestStatusAction.bind;
        },
        "bind",
      );
      const request = { id: "c0b91ad0-04c6-4e2a-8a78-fcda241411ac", status };
      const html = renderToStaticMarkup(
        <RequestStatusControls request={request} />,
      );
      expect(html.match(/<form\b/g)).toHaveLength(1);
      expect(html.match(/<button\b/g)).toHaveLength(2);
      expect(html).not.toContain(`>${statusLabels[status]}</button>`);
      for (const other of requestStatuses.filter((value) => value !== status)) {
        expect(html).toContain(`>${statusLabels[other]}</button>`);
        expect(bind).toHaveBeenCalledWith(null, request.id, other);
      }
      expect(html).toContain('aria-label="Atualizar status da solicitação"');
      expect(html).not.toContain('disabled=""');
    },
  );

  it("disables every control and announces the pending state", () => {
    state.pending = true;
    const html = renderToStaticMarkup(
      <RequestStatusControls request={{ id: "id", status: "new" }} />,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html.match(/\sdisabled=""/g)).toHaveLength(3);
    expect(html).toContain('role="status"');
    expect(html).toContain("Atualizando status…");
  });
});
