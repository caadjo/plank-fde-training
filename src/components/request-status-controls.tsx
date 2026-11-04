"use client";

import { useFormStatus } from "react-dom";
import { updateRequestStatusAction } from "@/app/requests/status-actions";
import { Button } from "@/components/ui/button";
import {
  requestStatuses,
  statusLabels,
  type WorkRequest,
} from "@/lib/requests/schema";

type RequestStatusControlsProps = {
  request: Pick<WorkRequest, "id" | "status">;
};

function StatusButtons({ request }: RequestStatusControlsProps) {
  const { pending } = useFormStatus();
  return (
    <fieldset disabled={pending} aria-busy={pending} className="space-y-3">
      <legend className="font-medium">Alterar status</legend>
      <div className="flex flex-wrap gap-2">
        {requestStatuses
          .filter((status) => status !== request.status)
          .map((status) => (
            <Button
              key={status}
              type="submit"
              variant="outline"
              disabled={pending}
              formAction={updateRequestStatusAction.bind(
                null,
                request.id,
                status,
              )}
            >
              {statusLabels[status]}
            </Button>
          ))}
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {pending
          ? "Atualizando status…"
          : "Escolha o próximo status da solicitação."}
      </p>
    </fieldset>
  );
}

export function RequestStatusControls({ request }: RequestStatusControlsProps) {
  return (
    <form aria-label="Atualizar status da solicitação">
      <StatusButtons request={request} />
    </form>
  );
}
