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
- `pnpm build`: build de produção.
- `pnpm start`: serve o build de produção.
- `pnpm check`: executa lint, formatação, tipos e build em sequência.

## Estrutura

- `src/app/`: rotas, layout, metadados e estilos globais (App Router).
- `src/components/ui/`: componentes Button e Card do shadcn/ui.
- `src/lib/utils.ts`: utilitário `cn`.
- `components.json`: configuração do CLI shadcn/ui.
- `.github/workflows/check.yml`: validação de pull requests e pushes para `main`.

O Dia 1 entrega a base técnica e uma tela inicial. Autenticação, execução de workflows e integrações serão implementadas nas próximas etapas do curso.
