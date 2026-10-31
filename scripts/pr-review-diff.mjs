import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export function command(bin, args, cwd) {
  const result = spawnSync(bin, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
    timeout: 60000,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${bin} ${args[0]} falhou (status ${result.status}). Confira autenticação, acesso e referência.`,
    );
  }
  return result.stdout.replace(/\r\n/g, "\n");
}

export function githubCli(run = command) {
  const candidates = ["gh", "gh.exe"];
  const bridge = "/mnt/c/Program Files/GitHub CLI/gh.exe";
  if (process.platform === "linux" && existsSync(bridge))
    candidates.push(bridge);
  if (process.platform === "win32")
    candidates.push(
      join(
        process.env.ProgramFiles || "C:\\Program Files",
        "GitHub CLI",
        "gh.exe",
      ),
    );
  for (const candidate of candidates) {
    try {
      run(candidate, ["--version"], process.cwd());
      return candidate;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  throw new Error(
    "GitHub CLI não encontrado. Instale e autentique gh no WSL, ou disponibilize gh.exe do Windows.",
  );
}

export function reviewDiff(pr, cwd = process.cwd(), run = command) {
  if (pr !== undefined && !/^[1-9]\d*$/.test(pr))
    throw new Error("Use apenas um número de PR positivo.");
  const root = run("git", ["rev-parse", "--show-toplevel"], cwd).trim();
  if (pr === undefined) {
    const mainSha = run("git", ["rev-parse", "main"], root).trim();
    const headSha = run("git", ["rev-parse", "HEAD"], root).trim();
    const baseSha = run("git", ["merge-base", mainSha, headSha], root).trim();
    const diff = run(
      "git",
      ["diff", "--no-ext-diff", "--no-textconv", baseSha, headSha, "--"],
      root,
    );
    return {
      mode: "branch",
      baseRef: "main",
      baseRefSha: mainSha,
      baseSha,
      headSha,
      command: `git diff --no-ext-diff --no-textconv ${baseSha} ${headSha} --`,
      diff,
    };
  }
  const remote = run("git", ["remote", "get-url", "origin"], root).trim();
  const match = remote.match(
    /^(?:git@github\.com:|https:\/\/github\.com\/|ssh:\/\/git@github\.com\/)([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/,
  );
  if (!match)
    throw new Error("O origin precisa identificar um repositório github.com.");
  const repo = `${match[1]}/${match[2]}`;
  const gh = githubCli(run);
  const readMetadata = () => {
    const data = JSON.parse(
      run(gh, ["api", `repos/${repo}/pulls/${pr}`], root),
    );
    return {
      number: data.number,
      url: data.html_url,
      baseRefOid: data.base?.sha,
      headRefOid: data.head?.sha,
    };
  };
  const before = readMetadata();
  if (
    before.number !== Number(pr) ||
    typeof before.baseRefOid !== "string" ||
    !before.baseRefOid ||
    typeof before.headRefOid !== "string" ||
    !before.headRefOid
  ) {
    throw new Error("Metadados do PR incompletos ou incompatíveis com o alvo.");
  }
  const diff = run(gh, ["pr", "diff", pr, "--repo", repo], root);
  const after = readMetadata();
  if (
    before.headRefOid !== after.headRefOid ||
    before.baseRefOid !== after.baseRefOid
  ) {
    throw new Error(
      "O PR mudou durante a leitura. Repita a revisão sobre um snapshot estável.",
    );
  }
  return {
    mode: "pull-request",
    repo,
    number: before.number,
    url: before.url,
    baseSha: before.baseRefOid,
    headSha: before.headRefOid,
    command: `gh pr diff ${pr} --repo ${repo}`,
    diff,
  };
}

const invoked =
  process.argv[1] &&
  existsSync(process.argv[1]) &&
  realpathSync(process.argv[1]) ===
    realpathSync(fileURLToPath(import.meta.url));
if (invoked) {
  try {
    if (process.argv.length > 3)
      throw new Error("Uso: node scripts/pr-review-diff.mjs [numero]");
    process.stdout.write(
      JSON.stringify(reviewDiff(process.argv[2]), null, 2) + "\n",
    );
  } catch (error) {
    process.stderr.write(`Revisão indisponível: ${error.message}\n`);
    process.exitCode = 1;
  }
}
