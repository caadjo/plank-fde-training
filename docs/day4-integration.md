# Integração local — Dia 4

A worktree `workbot-day4-integration`, na branch `feat/day4-integration`, parte de
`feat/admin-settings` e integra detalhe, status, filtros e políticas por merges locais.
As worktrees originais são preservadas. O aplicativo continua na raiz da worktree,
sem diretórios por dia; o README e o material anterior permanecem preservados.

## Contratos e instruções de pasta

- `src/lib/requests/AGENTS.md`: contrato compartilhado e armazenamento temporário.
- `src/app/requests/AGENTS.md`: rotas, Suspense, filtros e atualização de status.
- `content/policies/AGENTS.md`: Markdown com front matter estrito e exemplos fictícios.
- `getRequest`, `updateRequestStatus` e `listRequests(filters)` usam o mesmo armazenamento.
- O detalhe renderiza `RequestStatusControls`; a action invalida detalhe, lista e admin.
- O cabeçalho aponta para `/policies`; a listagem aponta para as oito políticas.

## Executar e conferir

Use Node.js >=22.13 e o pnpm fixado no package.json. Na nova worktree:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm start --port 3118
```

1. Abra <http://localhost:3118/requests/new> e crie uma solicitação fictícia.
2. Abra o detalhe pelo título na lista e altere o status.
3. Volte à lista e combine os filtros de equipe e status; confira também o admin.
4. Abra Políticas pelo cabeçalho, percorra as oito entradas e volte à listagem.
5. Confira 404 em `/requests/inexistente` e `/policies/inexistente`.
6. Repita em uma janela estreita e navegando com o teclado.

Os dados desaparecem ao reiniciar o processo e não são compartilhados entre instâncias.
Esta integração não implementa autenticação nem durabilidade. O site público fica
para outra etapa. Nenhum push, PR ou publicação faz parte deste trabalho.
