# Dia 3 — publicação em ordem

A implementação foi preparada localmente. Push, PR, merge, teste em produção e Verify Day 3 ficam com o proprietário.

As branches são cumulativas. Publique e integre uma de cada vez, na ordem abaixo. Abra o próximo PR somente depois do merge anterior, para que o diff mostre apenas a próxima entrega.

| Ordem | Branch                 | Entrega                                                         |
| ----- | ---------------------- | --------------------------------------------------------------- |
| 1     | feat/day3-review-fixes | Health por requisição e dependências de desenvolvimento — WOR-8 |
| 2     | feat/day3-backlog      | Backlog de 20 tickets, Figma e configuração MCP                 |
| 3     | feat/request-model     | Schema e armazenamento temporário — WOR-9                       |
| 4     | feat/request-intake    | Formulário e destino inicial do redirect — WOR-11               |
| 5     | feat/requests-list     | Tabela, badges e navegação — WOR-10                             |
| 6     | feat/requests-api      | GET/POST com contratos Zod — WOR-12                             |
| 7     | feat/admin-shell       | Layout e navegação administrativa — WOR-13                      |
| 8     | feat/admin-overview    | Contagens e cinco últimas solicitações — WOR-14                 |
| 9     | feat/admin-settings    | Migração de configurações e guia final — WOR-15                 |

## Primeiro PR

No WSL:

```bash
cd /mnt/c/Users/caiov/OneDrive/Documentos/ai-fde-training/plank-fde-training
git status --short
git switch feat/day3-review-fixes
pnpm check && git push -u origin feat/day3-review-fixes
gh pr create --web --base main --head feat/day3-review-fixes
```

O status deve estar limpo antes de trocar de branch. Pare um servidor de desenvolvimento que esteja usando esta pasta antes de alternar entre branches. O preview temporário da preparação está em outra pasta Linux.

No navegador, revise o diff, aguarde CI verde e Vercel preview, teste a alteração e use **Create a merge commit**. Não use squash nesta sequência: os commits anteriores são a base das próximas branches.

## Próximos PRs

Depois de integrar cada PR, execute o mesmo ciclo com a próxima branch da tabela:

```bash
git switch NOME_DA_BRANCH
pnpm check && git push -u origin NOME_DA_BRANCH
gh pr create --web --base main --head NOME_DA_BRANCH
```

Substitua NOME_DA_BRANCH pelo nome completo da linha correspondente. Não execute um loop que publique tudo sem revisar os resultados.

Se aparecer um erro de tipos em uma rota que não existe na branch atual, pare o Next em execução e limpe somente a pasta gerada `.next` deste clone, então repita `pnpm check`. Não remova arquivos de `src/` para corrigir tipos gerados de outra branch.

## Títulos e descrições em inglês

Use as descrições abaixo depois de executar a verificação local. Acrescente os horários reais e o resultado do preview antes do merge.

### 1 — fix: make health checks run per request (WOR-8)

The health endpoint now waits for an incoming connection instead of being prerendered. Move build-time tooling to devDependencies and add tests for connection handling.

Validation: pnpm check.

### 2 — docs: document the WorkBot backlog and MCP integrations

Document 20 Linear issues with acceptance criteria and sizes, link the Day 3 Figma frames, and configure project-scoped Linear, Figma and GitHub MCP servers. Credentials stay outside the repository.

Validation: project MCP configuration recognized; read-only integration queries succeeded.

### 3 — feat: add the request model and in-memory store (WOR-9)

Add a shared Zod schema and inferred request types. Create requests with server-generated IDs, timestamps and defaults, and list them newest first without exposing mutable store references.

Validation: pnpm check. Storage is intentionally process-local for this course stage.

### 4 — feat: add the request intake form (WOR-11)

Add /requests/new with native form controls and a Server Action. Invalid submissions return field errors and preserve entered values, including team and priority. Successful submissions redirect to an initial requests view so the flow works before the table PR.

Validation: pnpm check; submit valid and invalid forms in the preview.

### 5 — feat: list requests with status and priority (WOR-10)

Upgrade the initial requests view to a table with team, priority, status and creation date. Add an empty state and a navigation link, and test safe rendering of user-supplied titles.

Validation: pnpm check.

### 6 — feat: add the validated requests API (WOR-12)

Add GET and POST /api/requests using the shared model. Return 201 for creation, 400 for malformed or invalid input, and structured validation issues without echoing submitted values.

Validation: pnpm check; API responses are checked against Zod response schemas.

### 7 — feat: add admin navigation (WOR-13)

Add a responsive admin layout with sidebar navigation and an active-page indicator. Reuse the site header and keep settings reachable during the migration.

Validation: pnpm check.

### 8 — feat: add the admin request overview (WOR-14)

Show counts for every request status and up to five latest requests. Read changing data inside a Suspense boundary and reuse the requests table.

Validation: pnpm check; verify counts after creating a request.

### 9 — feat: move settings into admin (WOR-15)

Move settings to /admin/settings and redirect the existing /settings URL. Update navigation, footer and landing-page links while preserving environment and commit information.

Validation: pnpm check; verify both settings URLs.

## Smoke test em produção

Após cada merge, abra https://plank-fde-training-one.vercel.app/ e use a funcionalidade disponível. Após o último:

1. Envie um título com três espaços e selecione Finanças/Alta. O servidor deve mostrar o erro sem perder as seleções ou os detalhes.
2. Corrija o título e envie. Deve redirecionar para /requests.
3. Confira o registro, a equipe, a prioridade e o status na tabela.
4. Abra /api/requests e confira o mesmo registro.
5. Abra /admin e confira a contagem e as últimas solicitações.
6. Abra /settings e confirme o redirecionamento para /admin/settings.
7. Marque os tickets como Done no Linear somente após merge, CI verde e confirmação em produção.
8. Com todos os PRs integrados e publicados, execute Verify Day 3 na página do curso.

O armazenamento desta etapa fica em globalThis. Reinícios e instâncias distintas da Vercel podem perder ou divergir nos dados. Use dados fictícios; o banco de dados é trabalho posterior do curso.

## Registro honesto de tempo

Para consultar a criação de uma branch:

```bash
git reflog show --date=iso feat/request-model
```

Procure o evento de criação, sem confundi-lo com atualizações de rebase. Registre o horário real do merge no PR. Como as branches foram preparadas antes da publicação, o intervalo inclui a espera e não representa somente trabalho ativo. Não invente horários para atingir a meta de PRs por hora.

## Depois do último merge

```bash
git switch main
git pull --ff-only origin main
pnpm check
```

Não apague as branches locais durante esta sequência. Não é necessário force-push para a primeira publicação dessas branches.
