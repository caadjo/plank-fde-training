# WorkBot — Dia 1

Base da plataforma de workflows empresariais construída durante o curso AI FDE da Plank.
O README original do curso foi preservado. O aplicativo fica na raiz e evolui sem pastas por dia.

## Ambiente

- Node.js 22.13 ou superior (CI usa Node.js 22).
- pnpm na versão fixada em `package.json`.
- Se `pnpm` não estiver disponível, use `corepack enable` ou execute `corepack pnpm` no lugar de `pnpm`.

## Comandos

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
```

Abra <http://localhost:3000> durante o desenvolvimento.

- `pnpm lint`: ESLint sem warnings.
- `pnpm format`: aplica Prettier.
- `pnpm format:check`: verifica formatação.
- `pnpm typecheck`: gera os tipos de rotas e executa TypeScript.
- `pnpm test`: executa os testes com Vitest (`vitest run`).
- `pnpm build`: build de produção.
- `pnpm start`: serve o build de produção.
- `pnpm check`: executa lint, formatação, tipos, testes e build em sequência.

## Estrutura

- `src/app/`: rotas, layout, metadados e estilos globais (App Router).
- `src/components/site-header.tsx`: cabeçalho da página inicial.
- `src/components/site-header.test.tsx`: testes de renderização estática do cabeçalho.
- `vitest.config.mts`: configuração do Vitest com TSX e alias `@/` para `src/`.
- `src/components/ui/`: componentes Button e Card do shadcn/ui.
- `src/lib/utils.ts`: utilitário `cn`.
- `components.json`: configuração do CLI shadcn/ui.
- `.github/workflows/check.yml`: validação de pull requests e pushes para `main`.

O Dia 1 entrega a base técnica e uma tela inicial. Autenticação, execução de workflows e integrações serão implementadas nas próximas etapas do curso.

## Dia 2 — testes

O cabeçalho da página inicial foi extraído para `SiteHeader`, preservando a navegação e a acessibilidade. Os testes usam `renderToStaticMarkup` de `react-dom/server` e verificam a marca WorkBot e os links para `/` e `/settings`, sem depender de um navegador.

## Dia 2 — skills locais do Codex

As skills ficam em `.agents/skills/<nome>/SKILL.md`, com `name` e `description` no frontmatter YAML. Use `$nome` no prompt do Codex, informando o contrato desejado. Se a sessão já estava aberta antes da criação, abra uma nova sessão no repositório para descobrir as skills.

Exemplos de prompts (executam a criação ou verificação solicitada):

```text
$component Crie SummaryCard com título e descrição recebidos por props, usando o Card existente.

$api-route Crie echo com POST: receba { message: string não vazia } e devolva o mesmo objeto com status 200, sem persistência.

$pre-deploy Verifique o projeto e apresente a tabela de resultados e o veredito, sem publicar.
```

- `component`: cria componente com exportação nomeada e teste ao lado, seguindo o cabeçalho; importa por caminho, sem barrel files.
- `api-route`: cria schemas e tipos em `types.ts`, handlers em `route.ts` e testes em `route.test.ts`; instala Zod ao usar a skill se ainda estiver ausente.
- `pre-deploy`: verifica tipos, testes, chamadas `console.log` em `src/` e variáveis obrigatórias documentadas. Carrega `.env.local` quando existir, preserva o ambiente já definido e não mostra valores. Nunca publica.

`.env.example` documenta as variáveis e sua obrigatoriedade. Nesta etapa não há variáveis obrigatórias; `VERCEL_ENV` e `VERCEL_GIT_COMMIT_SHA` são opcionais no desenvolvimento e têm defaults em `src/lib/config.ts`. Para configurar valores locais, copie o exemplo para `.env.local`, que não deve ser versionado. A leitura de ambiente no aplicativo continua centralizada em `src/lib/config.ts`.
