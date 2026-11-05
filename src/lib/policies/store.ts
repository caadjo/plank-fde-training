import "server-only";
import { cacheLife } from "next/cache";
import { policySlugSchema, readPolicyCorpus } from "@/lib/policies/content";

export async function listPolicies() {
  "use cache";
  cacheLife("max");
  return readPolicyCorpus();
}

export async function getPolicy(slug: string) {
  "use cache";
  cacheLife("max");
  policySlugSchema.parse(slug);
  return (await listPolicies()).find((policy) => policy.slug === slug);
}
