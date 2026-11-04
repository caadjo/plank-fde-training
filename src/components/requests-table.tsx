import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  priorityLabels,
  statusLabels,
  teamLabels,
  type WorkRequest,
} from "@/lib/requests/schema";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function RequestsTable({
  requests,
  caption = "Solicitações mais recentes primeiro.",
}: {
  requests: WorkRequest[];
  caption?: string;
}) {
  if (!requests.length) {
    return (
      <div className="rounded-xl border px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">Nenhuma solicitação por aqui</h2>
        <p className="mx-auto mb-6 mt-2 max-w-prose text-sm text-muted-foreground">
          Encaminhe o primeiro pedido para operações, finanças ou suporte.
        </p>
        <Link
          href="/requests/new"
          className={buttonVariants({ variant: "outline" })}
        >
          Criar primeira solicitação
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-xl border p-4">
      <Table>
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Título</TableHead>
            <TableHead scope="col">Equipe</TableHead>
            <TableHead scope="col">Prioridade</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Criada em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="min-w-56 max-w-md whitespace-normal break-words font-medium">
                <Link
                  href={`/requests/${request.id}`}
                  className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {request.title}
                </Link>
              </TableCell>
              <TableCell>{teamLabels[request.team]}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.priority === "high" ? "destructive" : "outline"
                  }
                >
                  {priorityLabels[request.priority]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === "completed" ? "default" : "secondary"
                  }
                >
                  {statusLabels[request.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <time dateTime={request.createdAt}>
                  {dateFormatter.format(new Date(request.createdAt))}
                </time>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
