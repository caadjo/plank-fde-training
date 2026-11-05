import { RequestStatusControls } from "@/components/request-status-controls";
import { notFound } from "next/navigation";
import {
  priorityLabels,
  statusLabels,
  teamLabels,
} from "@/lib/requests/schema";
import { getRequest } from "@/lib/requests/store";
import { track } from "@/lib/analytics";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export async function RequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound();
  await track("request_viewed", { requestId: request.id, team: request.team });

  return (
    <article className="mt-6 max-w-3xl space-y-8">
      <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-4xl">
        {request.title}
      </h1>
      <dl className="grid grid-cols-1 gap-6 border-y py-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Equipe</dt>
          <dd className="mt-1 font-medium">{teamLabels[request.team]}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Prioridade</dt>
          <dd className="mt-1 font-medium">
            {priorityLabels[request.priority]}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Status</dt>
          <dd className="mt-1 font-medium">{statusLabels[request.status]}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Criada em</dt>
          <dd className="mt-1 font-medium">
            <time dateTime={request.createdAt}>
              {dateFormatter.format(new Date(request.createdAt))}
            </time>
          </dd>
        </div>
      </dl>
      <RequestStatusControls request={request} />
      <section aria-labelledby="request-details">
        <h2 id="request-details" className="text-lg font-semibold">
          Detalhes
        </h2>
        <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed">
          {request.details || "Nenhum detalhe informado."}
        </p>
      </section>
    </article>
  );
}
