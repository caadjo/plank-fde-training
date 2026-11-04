import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RequestDetail } from "./request-detail";

export const metadata: Metadata = { title: "Detalhe da solicitação" };

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="flex-1 py-10 sm:py-14">
      <Link
        href="/requests"
        className="text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Voltar às solicitações
      </Link>
      <Suspense
        fallback={
          <p role="status" className="py-8 text-muted-foreground">
            Carregando solicitação…
          </p>
        }
      >
        <RequestDetail params={params} />
      </Suspense>
    </main>
  );
}
