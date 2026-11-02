import Link from "next/link";
import { RequestsTable } from "@/components/requests-table";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  requestStatuses,
  statusLabels,
  type WorkRequest,
} from "@/lib/requests/schema";
import { getRequestSummary } from "@/lib/requests/summary";

export function AdminOverview({ requests }: { requests: WorkRequest[] }) {
  const { counts, latest } = getRequestSummary(requests);
  return (
    <div className="space-y-10">
      <section
        aria-label="Solicitações por status"
        className="grid gap-4 sm:grid-cols-3"
      >
        {requestStatuses.map((status) => (
          <Card key={status}>
            <CardHeader>
              <CardDescription>{statusLabels[status]}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {counts[status]}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>
      <section aria-labelledby="latest-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 id="latest-heading" className="text-xl font-semibold">
            Últimas solicitações
          </h2>
          <Link
            href="/requests"
            className={buttonVariants({ variant: "outline" })}
          >
            Ver todas
          </Link>
        </div>
        <RequestsTable
          requests={latest}
          caption="Até cinco solicitações mais recentes."
        />
      </section>
    </div>
  );
}
