import { mkdtemp, cp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  findPolicy,
  policiesDirectory,
  readPolicyCorpus,
} from "@/lib/policies/content";

vi.mock("server-only", () => ({}));
const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});
async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), "workbot-policies-"));
  directories.push(directory);
  return directory;
}
const valid = `---
slug: nona
title: Nona política
team: support
updatedAt: "2026-11-04"
summary: Exemplo fictício adicional.
---

## Exemplo
Conteúdo demonstrativo.
`;

describe("corpus de políticas", () => {
  it("valida as oito políticas e seus avisos", async () => {
    const policies = await readPolicyCorpus();
    expect(policies.map(({ slug }) => slug).sort()).toEqual([
      "atendimento",
      "compras",
      "despesas",
      "equipamentos",
      "ferias",
      "seguranca-da-informacao",
      "trabalho-remoto",
      "viagens",
    ]);
    for (const policy of policies)
      expect(policy.content).toContain("Exemplo fictício");
  });
  it("descobre uma nona política sem alterar código", async () => {
    const directory = await fixture();
    await cp(policiesDirectory, directory, { recursive: true });
    await writeFile(path.join(directory, "nona.md"), valid);
    expect(await readPolicyCorpus(directory)).toHaveLength(9);
    expect(await findPolicy("nona", directory)).toMatchObject({
      title: "Nona política",
    });
    expect(await findPolicy("ausente", directory)).toBeUndefined();
  });
  it.each([
    "../secret",
    "/tmp/file",
    "a/b",
    "a\\b",
    "%2e%2e",
    "a.md",
    "",
    "A",
    "a--b",
    "a\0b",
  ])("recusa slug %j antes do acesso ao disco", async (slug) => {
    await expect(
      findPolicy(slug, "/diretorio-que-nao-existe"),
    ).rejects.toThrow();
    await expect(
      findPolicy(slug, "/diretorio-que-nao-existe"),
    ).rejects.not.toThrow(/ENOENT/);
  });
  it.each([
    [
      "campo desconhecido",
      valid.replace("team: support", "team: support\nextra: rejeitar"),
    ],
    ["equipe desconhecida", valid.replace("support", "unknown")],
    ["data inválida", valid.replace("2026-11-04", "2026-02-30")],
    ["campo ausente", valid.replace("title: Nona política\n", "")],
    ["slug divergente", valid.replace("slug: nona", "slug: outra")],
    ["sem front matter", "Texto solto"],
    ["YAML inválido", valid.replace("team: support", "team: [")],
    ["corpo vazio", valid.split("## Exemplo")[0]],
  ])(
    "reporta arquivo com %s e não o converte em ausência",
    async (_, source) => {
      const directory = await fixture();
      await writeFile(path.join(directory, "nona.md"), source);
      await expect(findPolicy("ausente", directory)).rejects.toThrow(/nona.md/);
    },
  );
  it("reporta todos os arquivos inválidos", async () => {
    const directory = await fixture();
    await writeFile(path.join(directory, "a.md"), "inválido");
    await writeFile(path.join(directory, "b.md"), "inválido");
    await expect(readPolicyCorpus(directory)).rejects.toThrow(
      /a.md:[\s\S]*b.md:/,
    );
  });
});
