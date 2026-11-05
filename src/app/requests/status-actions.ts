"use server";

import { refresh, revalidatePath } from "next/cache";
import { workRequestSchema } from "@/lib/requests/schema";
import { updateRequestStatus } from "@/lib/requests/store";
import { track } from "@/lib/analytics";

export async function updateRequestStatusAction(
  id: unknown,
  status: unknown,
): Promise<void> {
  // Bound arguments are still supplied by an untrusted caller.
  const parsed = workRequestSchema.pick({ id: true, status: true }).parse({
    id,
    status,
  });
  const request = await updateRequestStatus(parsed.id, parsed.status);
  if (!request) throw new Error("Solicitação não encontrada.");
  await track("request_status_changed", {
    requestId: request.id,
    team: request.team,
    status: request.status,
  });

  revalidatePath(`/requests/${request.id}`);
  revalidatePath("/requests");
  revalidatePath("/admin");
  refresh();
}
