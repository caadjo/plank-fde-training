import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), "../.."));
const inside = (parent, path) => {
  const rel = relative(parent, path);
  return rel !== ".." && !rel.startsWith(".." + sep) && !isAbsolute(rel);
};

function editedPaths(event) {
  if (event.hook_event_name !== "PostToolUse") return [];
  const input = event.tool_input;
  if (event.tool_name === "apply_patch") {
    const patch = typeof input === "string" ? input : input?.command;
    if (typeof patch !== "string") throw new Error("Evento apply_patch sem command.");
    return [...patch.matchAll(/^\*\*\* (?:Add File|Update File|Move to): (.+)$/gm)]
      .map((match) => match[1].replace(/\r$/, ""));
  }
  if (event.tool_name === "Edit" || event.tool_name === "Write") {
    if (typeof input?.file_path !== "string") throw new Error("Evento de edição sem file_path.");
    return [input.file_path];
  }
  return [];
}

function format(event) {
  const cwd = resolve(event.cwd || root);
  if (!inside(root, realpathSync(cwd))) return;
  const targets = new Set();
  for (const file of editedPaths(event)) {
    const path = resolve(cwd, file);
    if (!inside(root, path)) continue;
    let real;
    try { real = realpathSync(path); } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (!inside(root, real) || !statSync(real).isFile()) continue;
    const rel = relative(root, real);
    if (/^(?:\.git|node_modules|\.next|sources)(?:[/\\]|$)/.test(rel) || /(^|[/\\])\.env(?:\.|$)/.test(rel)) continue;
    targets.add("./" + rel);
  }
  if (!targets.size) return;
  const require = createRequire(join(root, "package.json"));
  const manifest = require.resolve("prettier/package.json");
  const pkg = JSON.parse(readFileSync(manifest, "utf8"));
  const bin = typeof pkg.bin === "string" ? pkg.bin : pkg.bin.prettier;
  const result = spawnSync(process.execPath, [
    resolve(dirname(manifest), bin), "--write", "--ignore-unknown",
    "--ignore-path", join(root, ".prettierignore"), "--", ...targets,
  ], { cwd: root, shell: false, encoding: "utf8", timeout: 45000, windowsHide: true });
  if (result.error || result.status !== 0) {
    throw new Error("Prettier falhou nos arquivos editados. Execute pnpm format:check para conferir.");
  }
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: "Prettier executado nos arquivos editados compatíveis; ignores do projeto preservados." },
  }) + "\n");
}

try {
  const raw = readFileSync(0, "utf8");
  let event;
  try { event = JSON.parse(raw); } catch { throw new Error("Payload de hook inválido."); }
  if (!event || typeof event !== "object" || Array.isArray(event)) throw new Error("Payload de hook inválido.");
  format(event);
} catch (error) {
  process.stderr.write((error.message === "Payload de hook inválido." ? error.message : "Falha no hook de formatação. Confira a configuração e execute pnpm format:check.") + "\n");
  process.exitCode = 2;
}
