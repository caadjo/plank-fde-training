"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requestInputSchema } from "@/lib/requests/schema";
import { createRequest } from "@/lib/requests/store";
import type { RequestFormState } from "./form-state";

export async function submitRequest(
  _previousState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const input = {
    title: formData.get("title") ?? "",
    details: formData.get("details") ?? "",
    team: formData.get("team") ?? undefined,
    priority: formData.get("priority") ?? undefined,
  };
  const parsed = requestInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      values: {
        title: typeof input.title === "string" ? input.title : "",
        details: typeof input.details === "string" ? input.details : "",
        team: typeof input.team === "string" ? input.team : "operations",
        priority:
          typeof input.priority === "string" ? input.priority : "medium",
      },
      message: "Revise os campos indicados antes de enviar.",
    };
  }
  await createRequest(parsed.data);
  revalidatePath("/requests");
  revalidatePath("/admin");
  redirect("/requests");
}
