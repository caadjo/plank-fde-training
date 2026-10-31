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

## Dia 2 — revisão com três subagentes

As definições ficam em `.codex/agents/bug_hunter.toml`, `performance_reviewer.toml` e `security_reviewer.toml`. Elas herdam o modelo da sessão, sem fixar um modelo que sua conta possa não ter. O projeto permite três subagentes concorrentes em `.codex/config.toml`. As instruções são de somente leitura; as permissões continuam sendo as da sessão, não um novo sandbox.

Inicie o Codex nesta raiz e envie, no chat:

```text
$pr-review 1
```

Cada revisor executa o helper e consulta o snapshot por conta própria. O pai reúne resultados por gravidade, unifica duplicatas e preserva a atribuição. Revisão incompleta ou snapshots diferentes geram INCONCLUSIVO, e não uma aprovação simulada.

Sem número, `$pr-review` usa `git diff main...HEAD`: não inclui alterações sem commit. Mantenha a referência `main` atualizada. Para conferir somente a captura de diff:

```bash
node scripts/pr-review-diff.mjs 1
```

O helper usa GitHub CLI já autenticado. Obtém os SHAs pela API REST com `gh api repos/<owner>/<repo>/pulls/<numero>`, compatível com o gh 2.45, e o diff com `gh pr diff`. Não depende do campo `baseRefOid` de `gh pr view`. No WSL, procura `gh`, `gh.exe` e a instalação padrão do GitHub CLI do Windows. Não copia tokens nem modifica seu origin SSH. Se nenhum estiver disponível, instale e autentique o GitHub CLI no ambiente em que executa o Codex.

A primeira revisão do PR 1 está em [reviews/day2-pr-1.md](reviews/day2-pr-1.md). Nenhum comentário é enviado ao GitHub pela skill.

## Dia 2 — hook de Prettier

A configuração fica em `.codex/hooks.json`, com evento PostToolUse e matcher `^(apply_patch|Edit|Write)$`. O script lê JSON de stdin. Para apply_patch, extrai arquivos adicionados, atualizados e movidos do patch em `tool_input.command`; para Edit/Write, usa `tool_input.file_path`. Não executa o comando recebido.

O script resolve caminhos dentro deste repositório, recusa alvos externos e symlinks que escapem da raiz, ignora arquivos excluídos, ambiente, dependências e material em `sources/`, e respeita `.prettierignore`. Formatação é síncrona e não altera outros arquivos pendentes. O matcher não cobre edições feitas por comandos shell ou editores externos.

### Ativação na sua sessão

1. Abra uma nova sessão do Codex na raiz, se a configuração ainda não aparecer.
2. Digite `/hooks`, inspecione a definição de `.codex/hooks.json` e autorize-a se estiver de acordo. O Codex exige confiança na definição atual; mudanças posteriores podem exigir nova revisão.
3. Peça ao Codex para criar `src/hook-demo.ts` por apply_patch com `export const hookDemo={ok:true}`, sem executar Prettier manualmente.
4. Confira se o arquivo foi salvo como `export const hookDemo = { ok: true };` e se o evento do hook foi registrado. Uma execução manual do script não prova que a sessão ativou o hook.
5. Peça a remoção apenas desse arquivo de demonstração e execute `pnpm check`.

O hook foi implementado e testado, mas sua aprovação pessoal via `/hooks` não foi alterada por esta implementação.

Os testes de integração em `scripts/format-edits.test.ts` criam fixtures temporárias, alimentam eventos reais no script e conferem o conteúdo salvo. Incluem arquivos com espaço no nome, múltiplos arquivos, movimentação, alvos externos, symlinks, ignores, eventos não cobertos e falha de formatação. Não alteram o app para demonstrar o hook.

### Conferência antes de publicar

- Execute `pnpm check`.
- Confira `$pr-review 1` na sua sessão e a demonstração automática do hook após ativá-lo.
- Faça commits separados para revisão e hook, publique o PR, aguarde CI e confira o preview antes de fazer merge.
- Conclua os três cursos introdutórios pedidos pela aula e use Verify Day 2 após publicar. O resultado da plataforma é a confirmação da etapa.
