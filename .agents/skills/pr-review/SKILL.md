---
name: pr-review
description: Revisa um PR ou o diff da branch do WorkBot com três subagentes de bugs, performance e segurança, sem editar ou publicar.
---

# PR review

Skill interna do projeto WorkBot.

- Leia AGENTS.md. Receba um número de PR positivo; sem número, revise `main...HEAD` (isso não inclui alterações não commitadas). Não use o comando reservado `/review` como nome desta skill.
- Para um PR, obtenha o snapshot com `node scripts/pr-review-diff.mjs <numero>`. Sem número, use `node scripts/pr-review-diff.mjs`. O helper usa `gh pr diff` para PRs e resolve `main...HEAD` para SHAs imutáveis antes de ler o diff da branch. Ele também informa os SHAs. Se faltar CLI, autenticação ou referência, reporte o bloqueio sem inventar uma revisão.
- Inicie em paralelo os agentes `bug_hunter`, `performance_reviewer` e `security_reviewer`, definidos em `.codex/agents/`, com contextos novos. Envie a cada um apenas o alvo, o mesmo comando de diff, as convenções relevantes e a tarefa. Cada revisor executa o comando por conta própria e retorna o snapshot e seus achados. Não dê suspeitas nem conclusões antecipadas.
- Aguarde os três resultados. Só consolide se todos tiverem revisado a mesma base/head. Se um falhar ou os SHAs divergirem, declare revisão INCONCLUSIVA; não simule agentes nem troque uma revisão paralela por uma resposta da sessão principal. Diff vazio deve ser reportado como sem diferenças, sem aprovação de trabalho não commitado.
- Agrupe achados por P0/P1/P2/P3, unifique duplicatas preservando a atribuição a cada revisor e confirme que arquivo/linha e evidência correspondem ao snapshot. Leia contexto adicional quando necessário sem trocar branch ou alterar arquivos.
- Entregue: alvo e SHAs; participação dos três revisores; achados por gravidade com arquivo/linha, impacto e correção; limitações; veredito. Use BLOQUEADO para P0/P1, COM RESSALVAS para P2/P3, SEM ACHADOS quando os três terminarem sem problemas, ou INCONCLUSIVO quando faltar evidência. SEM ACHADOS não equivale a garantia de ausência de defeitos.
- Não edite arquivos, faça push, merge, deploy ou publique comentários. Salve relatório somente se solicitado. Antes de concluir, confira participação dos três agentes, consistência dos SHAs, atribuições e ausência de achados sem evidência.
