import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";
import { z } from "zod";
import { requestTeams } from "@/lib/requests/schema";

export const policySlugSchema = z
  .string()
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const policyMetadataSchema = z.strictObject({
  slug: policySlugSchema,
  title: z.string().trim().min(1).max(120),
  team: z.enum(requestTeams),
  updatedAt: z.iso.date(),
  summary: z.string().trim().min(1).max(300),
});
export type Policy = z.infer<typeof policyMetadataSchema> & { content: string };
export const policiesDirectory = path.join(process.cwd(), "content/policies");

// Directory is a trusted server-side argument, never a route parameter.
export async function readPolicyCorpus(
  directory = policiesDirectory,
): Promise<Policy[]> {
  // Runtime policy files are explicitly included in next.config.ts. The
  // configurable directory exists for isolated fixtures, not route input.
  const entries = await readdir(/* turbopackIgnore: true */ directory, {
    withFileTypes: true,
  });
  const policies: Policy[] = [];
  const errors: string[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.name.endsWith(".md") || entry.name === "AGENTS.md") continue;
    try {
      if (!entry.isFile())
        throw new Error("Esperado arquivo regular, sem links simbólicos.");
      const filenameSlug = entry.name.slice(0, -3);
      policySlugSchema.parse(filenameSlug);
      const source = await readFile(
        /* turbopackIgnore: true */ path.join(
          /* turbopackIgnore: true */ directory,
          entry.name,
        ),
        "utf8",
      );
      const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source);
      if (!match)
        throw new Error("Front matter obrigatório entre delimitadores ---.");
      const document = parseDocument(match[1]);
      if (document.errors.length)
        throw new Error(
          document.errors.map((error) => error.message).join("; "),
        );
      const metadata = policyMetadataSchema.parse(
        document.toJS({ maxAliasCount: 0 }),
      );
      if (metadata.slug !== filenameSlug)
        throw new Error("Slug deve coincidir com o nome do arquivo.");
      if (!match[2].trim()) throw new Error("Corpo Markdown obrigatório.");
      policies.push({ ...metadata, content: match[2].trim() });
    } catch (error) {
      errors.push(
        `${entry.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  if (errors.length)
    throw new Error(`Políticas inválidas:\n${errors.join("\n")}`);
  return policies;
}

export async function findPolicy(slug: string, directory = policiesDirectory) {
  policySlugSchema.parse(slug); // Reject before any filesystem access.
  return (await readPolicyCorpus(directory)).find(
    (policy) => policy.slug === slug,
  );
}
