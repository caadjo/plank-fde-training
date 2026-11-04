import Link from "next/link";
import { listPolicies } from "@/lib/policies/store";
import { teamLabels } from "@/lib/requests/schema";

export const metadata = { title: "Políticas demonstrativas" };

export default async function PoliciesPage() {
  const policies = await listPolicies();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Políticas demonstrativas
      </h1>
      <p className="mt-4 max-w-prose text-muted-foreground">
        Exemplos fictícios do curso WorkBot. Estes textos não representam regras
        reais do usuário ou de uma organização.
      </p>
      <ul className="mt-10 divide-y">
        {policies.map((policy) => (
          <li key={policy.slug} className="py-6">
            <h2 className="text-xl font-semibold">
              <Link
                className="rounded underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                href={`/policies/${policy.slug}`}
              >
                {policy.title}
              </Link>
            </h2>
            <p className="mt-2">{policy.summary}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {teamLabels[policy.team]} · Atualizado em{" "}
              <time dateTime={policy.updatedAt}>{policy.updatedAt}</time>
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
