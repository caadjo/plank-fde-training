import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RequestsTable } from "@/components/requests-table";
import { buttonVariants } from "@/components/ui/button";
import { listRequests } from "@/lib/requests/store";

export const metadata: Metadata = { title: "Solicitações" };

async function RequestList() {
  const requests = await listRequests();
  return <RequestsTable requests={requests} />;
}

export default function RequestsPage() {
  return (
    <main className="flex-1 py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Solicitações
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Acompanhe o trabalho encaminhado para sua equipe.
          </p>
        </div>
        <Link href="/requests/new" className={buttonVariants({ size: "lg" })}>
          Nova solicitação
        </Link>
      </div>
      <Suspense
        fallback={
          <p role="status" className="py-8 text-muted-foreground">
            Carregando solicitações…
          </p>
        }
      >
        <RequestList />
      </Suspense>
    </main>
  );
}
