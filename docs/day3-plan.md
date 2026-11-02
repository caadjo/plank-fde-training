# Dia 3 — plano de execução

Fonte: https://joinplank.com/ai-fde-course/ai-sdlc-workflow-day-3

## Objetivo

Entregar o fluxo de solicitações do WorkBot, com critérios no Linear, referências no Figma, testes e um PR por ticket. Publicação, merge e verificação no curso são feitos pelo proprietário.

## Ordem

| Etapa | Entrega              | Critério de conclusão                                                                      |
| ----- | -------------------- | ------------------------------------------------------------------------------------------ |
| 1     | Ajustes de revisão   | Health dinâmico no build; testes e CI aprovados.                                           |
| 2     | Backlog              | 20 tickets reais no Linear e cópia em docs/backlog.md, com 2–4 critérios e tamanho S/M.    |
| 3     | Design e integrações | Frames para as telas; agente lê um ticket, um frame e um PR pelos serviços conectados.     |
| 4     | Modelo               | Schema Zod compartilhado; createRequest/listRequests; testes de trim, defaults e rejeição. |
| 5     | Formulário           | /requests/new com Server Action, erros por campo e redirect no sucesso.                    |
| 6     | Lista                | /requests com tabela, badges, estado vazio e link no cabeçalho.                            |
| 7     | API                  | GET/POST /api/requests com contratos de resposta validados nos testes.                     |
| 8     | Admin                | Layout e navegação, overview com contagens e cinco mais recentes, /admin/settings.         |
| 9     | Publicação           | Sete tickets em sete PRs; CI/preview/revisão e uso em produção após cada merge.            |
| 10    | Encerramento         | Conferir critérios e acionar Verify Day 3 após publicar.                                   |

Os sete tickets de implementação correspondem a WB-5 até WB-11 na referência da aula. Os identificadores reais estão em docs/backlog.md: modelo WOR-9, formulário WOR-11, lista WOR-10, API WOR-12, layout WOR-13, overview WOR-14 e migração de configurações WOR-15. Não inserir IDs de tickets no código; usá-los nos assuntos dos commits e na documentação.

## Primeiro PR: ajustes de revisão

A revisão registrada do Dia 2 não confirmou achados. Esta inspeção adicional, orientada pelo Dia 3, encontrou a necessidade de impedir a pré-renderização de /api/health.

- Usar await connection() antes de produzir a resposta.
- Validar espera pela conexão e propagação de falhas.
- Mover shadcn e tw-animate-css para devDependencies, conforme a aula.
- Já presentes: defaults com ||, exceção para .env.example, *.log e permissions.contents: read no CI.
- Separator não existe nesta cópia; não há componente a remover.

Não atribuir esses ajustes a um revisor que não os reportou.

## Regras para as próximas entregas

- Especificar critérios antes de implementar; consultar o frame quando houver tela.
- Preservar o material do curso e as convenções em AGENTS.md.
- Usar uma única definição Zod para formulário, API e tipo inferido.
- Guardar dados em globalThis somente como exercício temporário. Reinícios perdem os dados e instâncias distintas da Vercel podem divergir; o banco chega no Dia 5.
- Leituras dinâmicas devem seguir a documentação do Next instalada, com io() e Suspense quando cabíveis.
- A área admin nesta etapa é uma estrutura de navegação, sem autorização implementada. Usar apenas dados fictícios; autenticação exige entrega própria.
- Após cada PR: revisão, pnpm check, CI e preview, merge pelo proprietário, teste manual em produção e atualização do ticket.
- Registrar horários reais de início/merge e gargalos. Dez PRs por hora é uma meta de prática, não motivo para inventar tempos ou pular testes.

## Dependências externas pendentes

- Concluído: workspace Workbot, equipe WOR, projeto WorkBot — AI FDE e 20 tickets WOR-5 a WOR-24. Tamanhos S/M estão nas descrições. Três registros históricos estão Done; o health e as novas entregas ficam pendentes.
- Concluído: arquivo Figma com formulário, lista, admin e configurações; frames vinculados a WOR-10, WOR-11 e WOR-13 a WOR-15.
- Configurar e autenticar as integrações no Codex do WSL. A integração desta conversa não autentica automaticamente outra sessão.
- A criação de contas, login e revisão de permissões precisam da participação do proprietário.

Nenhuma dessas etapas deve ser marcada como concluída apenas por haver arquivos locais.

## Validação inicial em 02/11/2026

pnpm check completo aprovado no repositório do WSL: lint, formatação, tipos, 18 testes e build. O build identifica /api/health como dinâmico (ƒ). Nenhum push ou merge foi feito pela sessão de preparação.

Configuração dos três MCPs preparada em .codex/config.toml, sem credenciais. Autenticação e consultas reais na sessão WSL continuam pendentes; seguir docs/day3-integrations.md.
