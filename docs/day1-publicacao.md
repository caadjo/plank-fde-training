# Publicação do Dia 1

As alterações foram preparadas localmente. Nenhuma branch foi enviada, nenhum PR foi aberto e nenhum deploy foi acionado.

## Ordem dos pull requests

As branches são cumulativas: cada uma parte da anterior. Publique e faça merge nesta ordem, sempre com base em `main`:

| Ordem | Branch                 | Entrega                                          |
| ----- | ---------------------- | ------------------------------------------------ |
| 1     | `feat/health-check`    | Configuração centralizada e GET /api/health      |
| 2     | `feat/settings`        | Ambiente e commit em /settings                   |
| 3     | `feat/home-navigation` | Página inicial e navegação                       |
| 4     | `feat/not-found`       | Página 404                                       |
| 5     | `feat/favicon`         | Ícone do WorkBot e limpeza dos assets do Next.js |
| 6     | `feat/robots`          | robots.txt para produção e previews              |
| 7     | `feat/metadata`        | Títulos, descrições, canonical e Open Graph      |
| 8     | `feat/footer`          | Rodapé compartilhado e este roteiro              |

Use merge commit, sem squash nem rebase, para preservar a ancestralidade das próximas branches. Assim cada PR seguinte exibirá somente a sua mudança quando o anterior já estiver em `main`.

## Preparar o GitHub CLI no WSL

O login no Windows e o login no WSL são separados. Confira `gh --version` e `gh auth status` no WSL. Se necessário, instale o GitHub CLI pelo guia oficial em https://github.com/cli/cli/blob/trunk/docs/install_linux.md e entre com `gh auth login`.

## Publicar uma branch por vez

Comece pela primeira branch. Substitua o nome nas seguintes:

```bash
git switch feat/health-check
pnpm check
git push -u origin feat/health-check
gh pr create --base main --head feat/health-check --fill
```

Revise o diff do PR e peça revisão ao Codex. Aguarde o GitHub Actions e o preview da Vercel. Abra o preview no desktop e no celular antes de fazer merge. Confirme que o PR traz só os commits esperados.

Após os checks passarem e a revisão estar resolvida:

```bash
gh pr checks NUMERO_DO_PR --watch
gh pr merge NUMERO_DO_PR --merge
```

Repita em ordem. Não é necessário fazer rebase das branches cumulativas. Ao terminar:

```bash
git switch main
git pull --ff-only
```

## Conferir as entregas

- `/api/health`: HTTP 200 e JSON com `status: "ok"` e o hash curto.
- `/settings`: ambiente e hash iguais aos do health check no mesmo deploy.
- Localmente, sem variáveis Vercel: ambiente `development` e commit `local`.
- Na produção: ambiente `production` e os primeiros sete caracteres do commit publicado.
- No preview: ambiente `preview`; compare o hash com o commit da branch do preview.
- Página inicial: links para configurações e health check funcionando.
- Endereço inexistente: mensagem de página não encontrada e retorno ao início.
- Ícone do WorkBot visível na aba do navegador.
- `/robots.txt`: permite a página pública em produção e bloqueia o rastreamento de previews. Isso não substitui autenticação.
- Título e canonical diferentes para início e configurações.
- Rodapé sem sobreposição e sem rolagem horizontal em telas pequenas.

URL de produção: https://plank-fde-training-one.vercel.app/

## Medir os cinco exercícios finais

Registre o tempo real da criação de cada branch até o merge do respectivo PR (404, favicon, robots, metadados e rodapé). O início pode ser consultado em `git reflog show NOME_DA_BRANCH --date=iso`; a entrada `branch: Created from HEAD` marca a criação local. O horário do merge ficará no PR.

Inclua a duração na descrição de cada PR. Como as branches já foram preparadas e ainda não foram publicadas, a duração inclui esse intervalo. Não registre tempos estimados como medições.

Depois dos cinco merges, anote aqui ou em outro documento qual foi o maior atraso e uma mudança no processo para a próxima rodada. A meta de dez PRs por hora é de prática; ainda não foi medida neste trabalho.

## Verificar no curso

Depois de confirmar produção, previews e CI, torne o repositório público conforme sua decisão e use Verify Day 1 na página da aula. Manter as oito entregas em PRs separados preserva a evidência do exercício.

## Validação local realizada

- `pnpm check`: ESLint, Prettier, tipos e build passaram.
- Build compilado servido localmente: início e configurações HTTP 200; health HTTP 200 com `{ "status": "ok", "commit": "local" }`.
- Configurações exibiram `development` e `local`, correspondendo ao health check.
- Configuração simulada de preview: ambiente `preview` e SHA longo reduzido a sete caracteres.
- URL inexistente: HTTP 404, mensagem personalizada e retorno ao início.
- Ícone SVG: HTTP 200 e Content-Type `image/svg+xml`.
- robots.txt local: HTTP 200, com rastreamento bloqueado.
- Canonical do início aponta para a origem de produção, normalizada sem barra final pelo Next.js; configurações aponta para `/settings`.
- Interface verificada em desktop (1280 × 720) e celular (375 × 720), sem rolagem horizontal nas páginas conferidas; navegação por teclado com foco visível.
- Revisão independente do código concluída; validação visual feita na sessão principal.

CI de cada nova branch, previews da Vercel, valores reais de ambiente/commit em produção, medições dos PRs e Verify Day 1 continuam pendentes da publicação.
