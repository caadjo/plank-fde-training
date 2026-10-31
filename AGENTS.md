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
