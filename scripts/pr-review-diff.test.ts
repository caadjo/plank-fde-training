import { describe, expect, it } from "vitest";
import { reviewDiff } from "./pr-review-diff.mjs";

function mockRemote(args: string[]) {
  if (args[0] === "--version") return "gh version 2.45.0";
  if (args[0] === "remote")
    return "git@github.com:caadjo/plank-fde-training.git";
  return "/repo";
}

describe("snapshot para revisão", () => {
  it("rejeita alvos inválidos antes de executar comandos", () => {
    for (const value of ["0", "-1", "1; echo indevido", "abc"]) {
      expect(() =>
        reviewDiff(value, "/repo", () => {
          throw new Error("Não deveria executar");
        }),
      ).toThrow("número de PR positivo");
    }
  });
  it("resolve main...HEAD e usa os SHAs efetivos no diff local", () => {
    const calls: string[] = [];
    const result = reviewDiff(
      undefined,
      "/repo",
      (_bin: string, args: string[]) => {
        calls.push(args.join(" "));
        if (args[0] === "diff") return "diff de teste";
        if (args[0] === "merge-base") return "base";
        if (args[1] === "HEAD") return "head";
        if (args[1] === "main") return "main";
        return "/repo";
      },
    );
    expect(result).toMatchObject({
      baseSha: "base",
      headSha: "head",
      diff: "diff de teste",
    });
    expect(calls).toContain("diff --no-ext-diff --no-textconv base head --");
  });
  it("usa a API REST disponível no gh 2.45 sem exigir baseRefOid em pr view", () => {
    const calls: string[][] = [];
    const result = reviewDiff("1", "/repo", (_bin: string, args: string[]) => {
      calls.push(args);
      if (args[0] === "pr" && args[1] === "view")
        throw new Error("Unknown JSON field: baseRefOid");
      if (args[0] === "api")
        return JSON.stringify({
          number: 1,
          html_url: "https://github.com/caadjo/plank-fde-training/pull/1",
          base: { sha: "base" },
          head: { sha: "head" },
        });
      if (args[0] === "pr" && args[1] === "diff") return "diff do PR";
      return mockRemote(args);
    });
    expect(result).toMatchObject({
      mode: "pull-request",
      number: 1,
      url: "https://github.com/caadjo/plank-fde-training/pull/1",
      baseSha: "base",
      headSha: "head",
      diff: "diff do PR",
    });
    expect(calls.filter((args) => args[0] === "api")).toEqual([
      ["api", "repos/caadjo/plank-fde-training/pulls/1"],
      ["api", "repos/caadjo/plank-fde-training/pulls/1"],
    ]);
    expect(calls).toContainEqual([
      "pr",
      "diff",
      "1",
      "--repo",
      "caadjo/plank-fde-training",
    ]);
  });
  it("não consolida um PR que muda durante a leitura", () => {
    let views = 0;
    expect(() =>
      reviewDiff("1", "/repo", (_bin: string, args: string[]) => {
        if (args[0] === "api")
          return JSON.stringify({
            number: 1,
            base: { sha: "base" },
            head: { sha: String(++views) },
          });
        if (args[1] === "diff") return "diff";
        return mockRemote(args);
      }),
    ).toThrow("mudou durante a leitura");
  });
  it("rejeita um origin com domínio parecido com github.com", () => {
    expect(() =>
      reviewDiff("1", "/repo", (_bin: string, args: string[]) =>
        args[0] === "remote"
          ? "https://evilgithub.com/caadjo/plank-fde-training.git"
          : "/repo",
      ),
    ).toThrow("origin precisa");
  });
  it("não aprova snapshots sem identificadores de commit", () => {
    expect(() =>
      reviewDiff("1", "/repo", (_bin: string, args: string[]) => {
        if (args[0] === "api") return JSON.stringify({ number: 1 });
        return mockRemote(args);
      }),
    ).toThrow("Metadados do PR incompletos");
  });
  it("mantém o diff nos SHAs capturados quando uma referência muda", () => {
    let liveHead = "captured";
    const result = reviewDiff(
      undefined,
      "/repo",
      (_bin: string, args: string[]) => {
        if (args[1] === "--show-toplevel") return "/repo";
        if (args[0] === "rev-parse" && args[1] === "main")
          return "main-captured";
        if (args[0] === "rev-parse" && args[1] === "HEAD") {
          const captured = liveHead;
          liveHead = "new-head";
          return captured;
        }
        if (args[0] === "merge-base")
          return args[2] === "captured" ? "base-captured" : "new-base";
        if (args[0] === "diff")
          return args.includes("captured") && args.includes("base-captured")
            ? "captured diff"
            : "new diff";
        throw new Error("Comando inesperado");
      },
    );
    expect(liveHead).toBe("new-head");
    expect(result).toMatchObject({
      baseSha: "base-captured",
      headSha: "captured",
      diff: "captured diff",
    });
  });
});
