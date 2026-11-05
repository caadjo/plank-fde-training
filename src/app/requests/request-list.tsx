import Link from "next/link";
import { RequestsTable } from "@/components/requests-table";
import { buttonVariants } from "@/components/ui/button";
import { listRequests } from "@/lib/requests/store";
import {
  parseRequestFilters,
  type RequestFilters,
} from "@/lib/requests/filters";
import {
  requestTeams,
  requestStatuses,
  teamLabels,
  statusLabels,
} from "@/lib/requests/schema";

export type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function filterHref(filters: RequestFilters) {
  const params = new URLSearchParams();
  if (filters.team) params.set("team", filters.team);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `/requests?${query}` : "/requests";
}

export async function RequestList({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseRequestFilters(await searchParams);
  const requests = await listRequests(filters);
  const hasFilters = Boolean(filters.team || filters.status);
  return (
    <>
      <div className="mb-6 space-y-4">
        {(["team", "status"] as const).map((field) => {
          const label = field === "team" ? "Equipe" : "Status";
          const options = field === "team" ? requestTeams : requestStatuses;
          return (
            <nav key={field} aria-label={`Filtrar por ${label.toLowerCase()}`}>
              <h2 className="mb-2 text-sm font-medium">{label}</h2>
              <ul className="flex flex-wrap gap-2">
                {[undefined, ...options].map((value) => {
                  const selected = filters[field] === value;
                  return (
                    <li key={value ?? "all"}>
                      <Link
                        href={filterHref({ ...filters, [field]: value })}
                        aria-current={selected ? "true" : undefined}
                        className={buttonVariants({
                          variant: selected ? "secondary" : "outline",
                          size: "lg",
                        })}
                      >
                        {value === undefined
                          ? field === "team"
                            ? "Todas as equipes"
                            : "Todos os status"
                          : field === "team"
                            ? teamLabels[value as keyof typeof teamLabels]
                            : statusLabels[value as keyof typeof statusLabels]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          );
        })}
        {hasFilters && (
          <Link
            href="/requests"
            className={buttonVariants({ variant: "link", size: "lg" })}
          >
            Limpar filtros
          </Link>
        )}
      </div>
      {hasFilters && requests.length === 0 ? (
        <div className="rounded-xl border px-6 py-12 text-center">
          <h2 className="text-lg font-semibold">
            Nenhuma solicitação encontrada
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma solicitação corresponde aos filtros selecionados. Limpe os
            filtros para ver todas.
          </p>
        </div>
      ) : (
        <RequestsTable requests={requests} />
      )}
    </>
  );
}
