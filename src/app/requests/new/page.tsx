import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "./request-form";

export const metadata: Metadata = { title: "Nova solicitação" };

export default function NewRequestPage() {
  return (
    <main className="flex-1 py-10 sm:py-14">
      <Link
        href="/requests"
        className="text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Voltar às solicitações
      </Link>
      <div className="mb-8 mt-6 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Nova solicitação
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Conte o que precisa e escolha a equipe responsável.
        </p>
      </div>
      <RequestForm />
    </main>
  );
}
