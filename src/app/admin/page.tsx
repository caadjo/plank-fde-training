import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOverview } from "@/components/admin-overview";
import { listRequests } from "@/lib/requests/store";

export const metadata: Metadata = { title: "Visão geral" };

async function OverviewData() {
  return <AdminOverview requests={await listRequests()} />;
}

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Visão geral
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Acompanhe as solicitações por status.
        </p>
      </div>
      <Suspense
        fallback={
          <p role="status" className="py-8 text-muted-foreground">
            Carregando visão geral…
          </p>
        }
      >
        <OverviewData />
      </Suspense>
    </div>
  );
}
