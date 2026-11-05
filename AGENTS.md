# WorkBot

Projeto do curso AI FDE da Plank. Preserve o README do modelo e o material de todas as etapas. O app evolui na raiz, sem diretórios por dia.

## Ambiente e comandos

Use Node.js >=22.13 e a versão do pnpm fixada em `package.json`. Se necessário, substitua `pnpm` por `corepack pnpm`.

- `pnpm install --frozen-lockfile`: instala as dependências do lockfile.
- `pnpm dev`: inicia o ambiente de desenvolvimento.
- `pnpm lint`: ESLint, sem warnings.
- `pnpm format`: aplica Prettier.
- `pnpm format:check`: verifica Prettier.
- `pnpm typecheck`: gera tipos do Next.js e verifica TypeScript.
- `pnpm test`: executa os testes com Vitest (`vitest run`).
- `pnpm build`: gera o build de produção.
- `pnpm start`: serve o build de produção.
- `pnpm check`: executa lint, formatação, tipos, testes e build; rode antes de entregar alterações.

## Convenções

- Next.js App Router em `src/app/`, TypeScript estrito e Tailwind CSS.
- Use Server Components por padrão; adicione `"use client"` apenas quando houver interação ou APIs do navegador.
- Leia variáveis de ambiente somente em `src/lib/config.ts`; importe `config` nos demais módulos.
- Alias de importação: `@/*` aponta para `src/*`.
- Componentes shadcn/ui ficam em `src/components/ui/`; use `cn` de `src/lib/utils.ts` para combinar classes.
- Use HTML semântico, foco visível, nomes acessíveis e layouts responsivos.
- Mantenha o lockfile pnpm atualizado e não adicione lockfiles de outros gerenciadores.
- Não versione segredos, `.env`, `node_modules` ou arquivos gerados em `.next`.
- O README original está fora do Prettier para preservar o material do curso.
- CI executa `pnpm check` em pull requests e pushes para `main`.
- Não faça push nem publique sem autorização explícita.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Skills, revisão e formatação

- Skills locais em `.agents/skills/`: `component`, `api-route`, `pre-deploy` e `pr-review`; invoque com `$nome` no Codex.
- `pr-review` delega em paralelo a `bug_hunter`, `performance_reviewer` e `security_reviewer`, definidos em `.codex/agents/`. Os revisores não editam nem publicam; herdam as permissões e o modelo da sessão.
- `node scripts/pr-review-diff.mjs [numero]` obtém o diff e os SHAs sem trocar branch. Sem número, cobre apenas `main...HEAD`, não o working tree.
- `.codex/hooks.json` registra Prettier após `apply_patch`, `Edit` e `Write`, usando `.codex/hooks/format-edits.mjs`. Respeite a revisão de confiança em `/hooks`; não contorne essa etapa.
- O hook considera só os arquivos da edição, respeita `.prettierignore` e não formata alvos fora do projeto. Edições por shell não são cobertas por esse matcher.

## Solicitações e administração

- Contrato compartilhado em `src/lib/requests/schema.ts`; não duplique validação entre formulário e API. Limites e defaults estão em `docs/specs/request-model.md`.
- `store.ts` usa `globalThis` apenas como armazenamento temporário do curso. Não oferece durabilidade nem compartilhamento entre instâncias; use somente dados fictícios nesta etapa.
- Leituras dinâmicas aguardam `io()` e aparecem sob `Suspense`. A Server Action invalida `/requests` e `/admin` antes de redirecionar.
- Preserve valores devolvidos após validação, inclusive os selects nativos. Confira também no navegador; o teste da action não demonstra o estado final do DOM.
- Schemas de resposta da API ficam em `src/app/api/requests/types.ts`; valide respostas nos testes e não converta falhas internas em 400.
- Configurações ficam em `/admin/settings`; `/settings` mantém compatibilidade por redirecionamento. O admin ainda não tem autenticação nesta etapa do curso.
- Backlog e integrações: `docs/backlog.md` e `docs/day3-integrations.md`. Ordem de publicação: `docs/day3-publicacao.md`.
