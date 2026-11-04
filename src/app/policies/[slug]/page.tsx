import Link from "next/link";
import { notFound } from "next/navigation";
import { PolicyBody } from "@/components/policy-body";
import { getPolicy, listPolicies } from "@/lib/policies/store";
import { policySlugSchema } from "@/lib/policies/content";
import { teamLabels } from "@/lib/requests/schema";

export async function generateStaticParams() {
  return (await listPolicies()).map(({ slug }) => ({ slug }));
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!policySlugSchema.safeParse(slug).success) notFound();
  const policy = await getPolicy(slug);
  if (!policy) notFound();
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/policies"
        className="rounded underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Todas as políticas demonstrativas
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        {policy.title}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {teamLabels[policy.team]} · Atualizado em{" "}
        <time dateTime={policy.updatedAt}>{policy.updatedAt}</time>
      </p>
      <p className="my-6">{policy.summary}</p>
      <PolicyBody content={policy.content} />
    </main>
  );
}
