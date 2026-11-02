import { Suspense } from "react";
import Link from "next/link";
import { listRequests } from "@/lib/requests/store";
import { buttonVariants } from "@/components/ui/button";

async function SubmittedRequests() {
  const requests = await listRequests();
  if (!requests.length)
    return (
      <p className="text-muted-foreground">Nenhuma solicitação recebida.</p>
    );
  return (
    <ul className="divide-y rounded-xl border px-6">
      {requests.map((request) => (
        <li key={request.id} className="py-4 break-words">
          {request.title}
        </li>
      ))}
    </ul>
  );
}

export default function RequestsPage() {
  return (
    <main className="flex-1 space-y-8 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Solicitações</h1>
      <Suspense fallback={<p role="status">Carregando solicitações…</p>}>
        <SubmittedRequests />
      </Suspense>
      <Link
        href="/requests/new"
        className={buttonVariants({ variant: "outline" })}
      >
        Nova solicitação
      </Link>
    </main>
  );
}
