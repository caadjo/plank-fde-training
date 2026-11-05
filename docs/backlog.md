# Backlog do WorkBot — Linear

Fonte do Dia 3: https://joinplank.com/ai-fde-course/ai-sdlc-workflow-day-3

Tickets criados no Linear em 02/11/2026, no projeto WorkBot — AI FDE: https://linear.app/workbot/project/workbot-ai-fde-1be884145f77/issues. Os IDs WOR são reais. Os itens WOR-16 a WOR-24 são propostas para refinamento nas aulas seguintes; não representam requisitos já confirmados dessas aulas.

S = menos de uma hora; M = duas a quatro horas, como estimativas de escopo, não horas já trabalhadas. Para os itens com tela, vincular um frame real do Figma antes da implementação. Não inventar URLs.

| Ticket Linear | Entrega                            | Tamanho | Situação                                       | Design                                                                     |
| ------------- | ---------------------------------- | ------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| WOR-5         | Estrutura e pipeline inicial       | S       | Concluído no Dia 1                             | Não se aplica                                                              |
| WOR-8         | Endpoint de saúde                  | S       | Ajuste dinâmico preparado; aguarda PR/produção | Não se aplica                                                              |
| WOR-6         | Landing e navegação                | S       | Concluído no Dia 1                             | Frame pendente                                                             |
| WOR-7         | Configurações e publicação inicial | S       | Concluído no Dia 1                             | Frame pendente                                                             |
| WOR-9         | Modelo de solicitações             | S       | Preparado localmente; aguarda PR/produção      | Não se aplica                                                              |
| WOR-11        | Formulário de solicitação          | M       | Preparado localmente; aguarda PR/produção      | [Frame](https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-297) |
| WOR-10        | Lista de solicitações              | S       | Preparado localmente; aguarda PR/produção      | [Frame](https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-354) |
| WOR-12        | API de solicitações                | S       | Preparado localmente; aguarda PR/produção      | Não se aplica                                                              |
| WOR-13        | Layout administrativo              | S       | Preparado localmente; aguarda PR/produção      | [Frame](https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-388) |
| WOR-14        | Overview administrativo            | S       | Preparado localmente; aguarda PR/produção      | [Frame](https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-388) |
| WOR-15        | Configurações no admin             | S       | Preparado localmente; aguarda PR/produção      | [Frame](https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-427) |
| WOR-16        | Detalhe de solicitação             | S       | Proposta — confirmar escopo do Dia 4           | Frame pendente                                                             |
| WOR-17        | Filtros da lista                   | S       | Proposta — confirmar escopo do Dia 4           | Frame pendente                                                             |
| WOR-18        | Pesquisa de solicitações           | S       | Proposta — confirmar escopo do Dia 4           | Frame pendente                                                             |
| WOR-19        | Atualização de status              | S       | Proposta — confirmar escopo do Dia 4           | Frame pendente                                                             |
| WOR-20        | Estados de carregamento e falha    | S       | Proposta — confirmar escopo do Dia 4           | Frame pendente                                                             |
| WOR-21        | Configuração do banco              | M       | Proposta — confirmar escopo do Dia 5           | Não se aplica                                                              |
| WOR-22        | Persistência das solicitações      | M       | Proposta — confirmar escopo do Dia 5           | Não se aplica                                                              |
| WOR-23        | Consultas e paginação              | S       | Proposta — confirmar escopo do Dia 5           | Não se aplica                                                              |
| WOR-24        | Teste integrado e guia operacional | S       | Proposta — confirmar escopo dos Dias 4–5       | Não se aplica                                                              |

## WOR-5 — Estrutura e pipeline inicial

Tamanho: S. Situação: Concluído no Dia 1.

Critérios de aceite:

- Next.js, TypeScript, Tailwind, App Router e src/ preservam o material do curso.
- pnpm check cobre lint, formatação, tipos, testes e build.
- GitHub Actions valida PRs e pushes para main.

## WOR-8 — Endpoint de saúde

Tamanho: S. Situação: Ajuste dinâmico preparado; aguarda PR/produção.

Critérios de aceite:

- GET /api/health retorna status e commit curto.
- A resposta não expõe segredos.
- O build identifica a rota como dinâmica após o ajuste do Dia 3.

## WOR-6 — Landing e navegação

Tamanho: S. Situação: Concluído no Dia 1.

Critérios de aceite:

- A página identifica o WorkBot.
- Os links internos funcionam por teclado.
- Layout responsivo mantém foco visível.

## WOR-7 — Configurações e publicação inicial

Tamanho: S. Situação: Concluído no Dia 1.

Critérios de aceite:

- A página de configurações exibe ambiente e commit.
- A aplicação está disponível na URL de produção.
- Os valores ausentes usam defaults documentados.

## WOR-9 — Modelo de solicitações

Tamanho: S. Situação: Preparado localmente; aguarda PR/produção.

Critérios de aceite:

- Schema Zod valida título, detalhes, equipe e prioridade e exporta o tipo inferido.
- createRequest aplica trim e defaults e rejeita valores inválidos; listRequests ordena do mais recente.
- Estado em globalThis tem testes isolados, id e data gerados pelo servidor.

## WOR-11 — Formulário de solicitação

Tamanho: M. Situação: Preparado localmente; aguarda PR/produção.

Critérios de aceite:

- /requests/new usa Input, Textarea e NativeSelect com labels associados.
- Server Action usa o schema compartilhado e devolve erros por campo, preservando entradas válidas.
- Sucesso redireciona para /requests; envio pendente tem feedback acessível.

## WOR-10 — Lista de solicitações

Tamanho: S. Situação: Preparado localmente; aguarda PR/produção.

Critérios de aceite:

- /requests mostra tabela com prioridade/status e ordenação decrescente de criação.
- Lista vazia mostra orientação e botão para criar solicitação.
- Cabeçalho tem link para a lista e leitura dinâmica respeita Suspense.

## WOR-12 — API de solicitações

Tamanho: S. Situação: Preparado localmente; aguarda PR/produção.

Critérios de aceite:

- GET/POST /api/requests reutilizam o modelo e as regras de validação.
- POST válido retorna 201; JSON malformado e dados inválidos retornam 400 sem ecoar valores sensíveis.
- Testes verificam respostas contra schemas, incluindo a criação seguida de listagem.

## WOR-13 — Layout administrativo

Tamanho: S. Situação: Preparado localmente; aguarda PR/produção.

Critérios de aceite:

- /admin tem layout com navegação sem duplicar o cabeçalho global.
- Há links para overview e configurações, com indicação da página atual.
- Navegação é acessível e funciona em tela pequena.

## WOR-14 — Overview administrativo

Tamanho: S. Situação: Preparado localmente; aguarda PR/produção.

Critérios de aceite:

- Uma contagem é exibida para cada status definido no modelo.
- São mostradas até cinco solicitações mais recentes.
- Estado vazio e leitura dinâmica não quebram o build.

## WOR-15 — Configurações no admin

Tamanho: S. Situação: Preparado localmente; aguarda PR/produção.

Critérios de aceite:

- Configurações ficam em /admin/settings preservando conteúdo.
- /settings redireciona para o novo endereço e links/testes são atualizados.
- A migração não causa links internos quebrados.

## WOR-16 — Detalhe de solicitação

Tamanho: S. Situação: Proposta — confirmar escopo do Dia 4.

Critérios de aceite:

- Uma solicitação pode ser aberta por id a partir da lista.
- Id inexistente apresenta estado 404 apropriado.
- Título, detalhes, equipe, prioridade e status são exibidos com texto tratado como texto.

## WOR-17 — Filtros da lista

Tamanho: S. Situação: Proposta — confirmar escopo do Dia 4.

Critérios de aceite:

- Lista pode ser filtrada por equipe e status.
- Filtros ficam na URL e preservam links compartilháveis.
- Nenhum resultado tem estado vazio distinto e opção de limpar filtros.

## WOR-18 — Pesquisa de solicitações

Tamanho: S. Situação: Proposta — confirmar escopo do Dia 4.

Critérios de aceite:

- Pesquisa considera o título com comparação sem distinção de caixa.
- Termo vazio equivale à listagem padrão e combina com os filtros.
- Termos especiais são tratados como dados e os casos são testados.

## WOR-19 — Atualização de status

Tamanho: S. Situação: Proposta — confirmar escopo do Dia 4.

Critérios de aceite:

- Somente status definidos pelo modelo são aceitos.
- Id inexistente não cria um registro implicitamente.
- Lista, detalhe e overview refletem a alteração.

## WOR-20 — Estados de carregamento e falha

Tamanho: S. Situação: Proposta — confirmar escopo do Dia 4.

Critérios de aceite:

- Rotas de solicitações e admin têm fallback legível.
- Falhas apresentam orientação de recuperação sem expor detalhes internos.
- Conteúdo continua utilizável por teclado e leitores de tela.

## WOR-21 — Configuração do banco

Tamanho: M. Situação: Proposta — confirmar escopo do Dia 5.

Critérios de aceite:

- Banco e credenciais são configurados por variáveis de ambiente documentadas.
- Schema e migrações são versionados sem segredos.
- Ambiente de teste fica separado dos dados de produção.

## WOR-22 — Persistência das solicitações

Tamanho: M. Situação: Proposta — confirmar escopo do Dia 5.

Critérios de aceite:

- Repositório de dados substitui globalThis por consultas persistentes.
- Contratos do modelo, formulário e API são preservados.
- Dados continuam disponíveis após reinício e entre instâncias.

## WOR-23 — Consultas e paginação

Tamanho: S. Situação: Proposta — confirmar escopo do Dia 5.

Critérios de aceite:

- Listagem tem limite e paginação com ordenação estável.
- Filtros e contagens consultam dados persistentes corretamente.
- Testes cobrem páginas vazias e parâmetros inválidos.

## WOR-24 — Teste integrado e guia operacional

Tamanho: S. Situação: Proposta — confirmar escopo dos Dias 4–5.

Critérios de aceite:

- Teste cobre criar solicitação e vê-la na lista, API e overview.
- Guia registra configuração, migrações e procedimento de smoke test.
- Limitações e pendências de autenticação ficam explícitas antes de uso real.

## Integrações e design

O cadastro do backlog foi feito pelo navegador na conta do proprietário. A leitura via MCP na sessão Codex do WSL foi configurada e testada em 02/11/2026: WOR-9 no Linear, frame do formulário no Figma e PR 1 no GitHub retornaram conteúdo real. Quatro frames editáveis foram criados no Figma e vinculados aos cinco tickets de telas do Dia 3; links na tabela e em docs/day3-integrations.md. Referências para telas futuras continuam pendentes.
