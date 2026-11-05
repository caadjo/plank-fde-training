import "@/testing/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { track } from "@/lib/analytics";
import { refresh, revalidatePath } from "next/cache";
import { createRequest, listRequests } from "@/lib/requests/store";
import { updateRequestStatusAction } from "./status-actions";
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

vi.mock("next/cache", () => ({
  io: vi.fn().mockResolvedValue(undefined),
  refresh: vi.fn(),
  revalidatePath: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateRequestStatusAction", () => {
  it("writes before invalidating affected views and refreshing", async () => {
    const request = await createRequest({ title: "Atualizar acesso" });
    vi.mocked(refresh).mockImplementationOnce(() => {
      expect(revalidatePath).toHaveBeenCalledTimes(3);
    });
    await updateRequestStatusAction(request.id, "completed");
    expect(await listRequests()).toEqual([{ ...request, status: "completed" }]);
    expect(revalidatePath).toHaveBeenCalledWith(`/requests/${request.id}`);
    expect(revalidatePath).toHaveBeenCalledWith("/requests");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
    expect(track).toHaveBeenCalledWith("request_status_changed", {
      requestId: request.id,
      team: request.team,
      status: "completed",
    });
  });

  it.each([null, undefined, 10, {}, ["completed"], "unknown"])(
    "rejects an untrusted bound status: %j",
    async (status) => {
      const request = await createRequest({ title: "Atualizar acesso" });
      await expect(
        updateRequestStatusAction(request.id, status),
      ).rejects.toThrow();
      expect(await listRequests()).toEqual([request]);
      expect(refresh).not.toHaveBeenCalled();
      expect(track).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );

  it.each([null, {}, "not-a-uuid", "c0b91ad0-04c6-4e2a-8a78-fcda241411ac"])(
    "rejects invalid or missing IDs without refresh: %j",
    async (id) => {
      await expect(
        updateRequestStatusAction(id, "completed"),
      ).rejects.toThrow();
      expect(await listRequests()).toEqual([]);
      expect(refresh).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );
});
