import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const project = process.cwd();
const fixtures: string[] = [];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "workbot-hook-"));
  fixtures.push(root);
  mkdirSync(join(root, ".codex/hooks"), { recursive: true });
  mkdirSync(join(root, "src"), { recursive: true });
  copyFileSync(
    join(project, ".codex/hooks/format-edits.mjs"),
    join(root, ".codex/hooks/format-edits.mjs"),
  );
  writeFileSync(join(root, "package.json"), "{}");
  writeFileSync(
    join(root, ".prettierignore"),
    "README.md\nignored/\n.codex/\n",
  );
  symlinkSync(join(project, "node_modules"), join(root, "node_modules"), "dir");
  return root;
}
function invoke(root: string, input: unknown) {
  return spawnSync(
    process.execPath,
    [join(root, ".codex/hooks/format-edits.mjs")],
    {
      input: typeof input === "string" ? input : JSON.stringify(input),
      encoding: "utf8",
      cwd: root,
      timeout: 20000,
    },
  );
}
afterEach(() => {
  for (const root of fixtures.splice(0)) {
    if (!root.startsWith(join(tmpdir(), "workbot-hook-")))
      throw new Error("Fixture inesperada.");
    rmSync(root, { recursive: true, force: true });
  }
});
const raw = "export const value={ok:true}\n";
const formatted = "export const value = { ok: true };\n";

describe("hook de formatação", () => {
  it("formata só o arquivo escrito, inclusive caminhos com espaços", () => {
    const root = fixture();
    writeFileSync(join(root, "src/arquivo com espaço.ts"), raw);
    writeFileSync(join(root, "src/nao-editado.ts"), raw);
    const result = invoke(root, {
      hook_event_name: "PostToolUse",
      tool_name: "Write",
      cwd: root,
      tool_input: { file_path: "src/arquivo com espaço.ts" },
    });
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(join(root, "src/arquivo com espaço.ts"), "utf8")).toBe(
      formatted,
    );
    expect(readFileSync(join(root, "src/nao-editado.ts"), "utf8")).toBe(raw);
    expect(JSON.parse(result.stdout).hookSpecificOutput.hookEventName).toBe(
      "PostToolUse",
    );
  });
  it("trata múltiplos arquivos, movimentações e exclusões em apply_patch", () => {
    const root = fixture();
    for (const name of ["novo", "atualizado", "movido"])
      writeFileSync(join(root, `src/${name}.ts`), raw);
    const patch =
      "*** Begin Patch\n*** Add File: src/novo.ts\n+export const value={ok:true}\n*** Update File: src/atualizado.ts\n@@\n*** Update File: src/antigo.ts\n*** Move to: src/movido.ts\n@@\n*** Delete File: src/excluido.ts\n*** End Patch";
    const result = invoke(root, {
      hook_event_name: "PostToolUse",
      tool_name: "apply_patch",
      cwd: root,
      tool_input: { command: patch },
    });
    expect(result.status, result.stderr).toBe(0);
    for (const name of ["novo", "atualizado", "movido"])
      expect(readFileSync(join(root, `src/${name}.ts`), "utf8")).toBe(
        formatted,
      );
    expect(existsSync(join(root, "src/excluido.ts"))).toBe(false);
  });
  it("não formata travessias nem symlinks para fora do projeto", () => {
    const root = fixture();
    const outside = mkdtempSync(join(tmpdir(), "workbot-hook-outside-"));
    fixtures.push(outside);
    const target = join(outside, "externo.ts");
    writeFileSync(target, raw);
    symlinkSync(target, join(root, "src/link.ts"));
    for (const file of [
      target,
      resolve(root, "../", outside.split("/").pop()!, "externo.ts"),
      "src/link.ts",
    ]) {
      const result = invoke(root, {
        hook_event_name: "PostToolUse",
        tool_name: "Edit",
        cwd: root,
        tool_input: { file_path: file },
      });
      expect(result.status, result.stderr).toBe(0);
    }
    expect(readFileSync(target, "utf8")).toBe(raw);
  });
  it("respeita os ignores e arquivos sem parser", () => {
    const root = fixture();
    writeFileSync(join(root, "README.md"), "#  Modelo original\n");
    writeFileSync(join(root, "src/arquivo.bin"), raw);
    for (const file of ["README.md", "src/arquivo.bin"]) {
      const before = readFileSync(join(root, file), "utf8");
      const result = invoke(root, {
        hook_event_name: "PostToolUse",
        tool_name: "Write",
        cwd: root,
        tool_input: { file_path: file },
      });
      expect(result.status, result.stderr).toBe(0);
      expect(readFileSync(join(root, file), "utf8")).toBe(before);
    }
  });
  it("ignora outros eventos e não executa comandos recebidos", () => {
    const root = fixture();
    const result = invoke(root, {
      hook_event_name: "PostToolUse",
      tool_name: "Bash",
      cwd: root,
      tool_input: { command: "touch arquivo-indesejado" },
    });
    expect(result.status).toBe(0);
    expect(existsSync(join(root, "arquivo-indesejado"))).toBe(false);
  });
  it("falha sem reproduzir payload inválido nem código com erro de sintaxe", () => {
    const root = fixture();
    const invalid = invoke(root, "segredo-do-payload");
    expect(invalid.status).toBe(2);
    expect(invalid.stderr).not.toContain("segredo-do-payload");
    writeFileSync(join(root, "src/invalido.ts"), "export const segredo = ;");
    const result = invoke(root, {
      hook_event_name: "PostToolUse",
      tool_name: "Write",
      cwd: root,
      tool_input: { file_path: "src/invalido.ts" },
    });
    expect(result.status).toBe(2);
    expect(result.stderr).not.toContain("export const");
  });
});
