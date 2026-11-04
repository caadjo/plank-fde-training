import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { RequestList, type SearchParams } from "./request-list";

export const metadata: Metadata = { title: "Solicitações" };

export default function RequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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
        <RequestList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
