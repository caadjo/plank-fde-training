# Dia 5 — dados persistentes, MCPs e analytics

## Implementação

- `src/lib/db.ts`: uma instrução SQL parametrizada por consulta; postgres.js para URLs PostgreSQL, PGlite em `.data/pg` quando não há URL e `memory://` nos testes.
- `src/lib/schema.ts`: tabela requests, constraints e índices idempotentes. Reiniciar a aplicação não recria nem apaga registros existentes.
- `src/lib/request-model.ts`: schemas, tipos e rótulos sem dependências de banco, importáveis pelo cliente. `src/lib/requests.ts` contém as consultas; os imports antigos continuam compatíveis.
- `GET /api/health`: SELECT 1, 200 quando saudável e 503 quando o banco falha, sem detalhes internos. A página 404 existente foi preservada e `error.tsx` permite tentar novamente.
- MCP do banco: query, schema, describe-table e recurso db://tables. A entrada stdio usa conexão separada com papel SELECT-only, transações READ ONLY, protocolo de uma instrução, prazo de cinco segundos e limite de 100 linhas. O papel do banco é a proteção de permissões; annotations são apenas metadados.
- Analytics: cookie anônimo UUID, quatro eventos, propriedades validadas e envio com after(). Eventos não incluem título, detalhes, email, IP ou dados de formulário. Prefetches são ignorados. Falha de analytics não bloqueia a solicitação.
- MCP do PostHog: get-events, get-event-definitions e check-event-fired. A chave pessoal só é usada no servidor local. Perfis e propriedades internas com `$` são omitidos das respostas.

O proxy encaminha o cookie criado para a primeira renderização e também o devolve ao navegador. Os eventos após o formulário carregam requestId e team; a alteração inclui status. As visualizações são renderizações do servidor, não uma prova de leitura humana; reloads e renderizações após ações podem gerar novas visualizações.

## Base e publicação

Branch local: `feat/day5-data-and-mcp`, na worktree `workbot-day5`. Base: integração local do Dia 4, commit 0b69d55. Os seis ajustes ainda sem commit daquela integração foram copiados e preservados aqui; as pastas originais não foram alteradas. A main local estava no merge do PR #20 do Dia 3 quando a preparação começou.

Publicação em 05/11/2026: o Dia 4 foi integrado pelo PR #21 e o Dia 5 foi enviado no PR #22, agora com base main. O banco Neon workbot-postgres foi criado no plano Free, região iad1, e conectado à Vercel em Production e Preview, com branches de banco para os previews. DATABASE_URL é gerenciado pela integração. POSTHOG_KEY e POSTHOG_HOST foram autorizados para ambos os ambientes; a chave pessoal de leitura permanece local. O PR do Dia 5 só será integrado após a conferência do preview. O site público não é alterado por esta etapa.

## Rodar no WSL

```bash
cd /mnt/c/Users/caiov/OneDrive/Documentos/ChatGPT/AI-FDE/workbot-day5
pnpm install --frozen-lockfile
pnpm dev --port 3015
```

Abra http://localhost:3015/requests/new. A instalação local foi preparada com Postgres 16 já existente no WSL, banco isolado `workbot_day5` e papéis exclusivos de aplicação/leitura. `.env.local` contém as conexões geradas e é ignorado pelo Git. Não cole seu conteúdo no chat.

Sem DATABASE_URL, o app usa PGlite persistente local. PGlite não compartilha a mesma pasta entre vários processos; para app e MCP simultâneos use Postgres. Vercel exige PostgreSQL remoto por DATABASE_URL; o banco local do WSL não atende o deploy.

## Configurar Postgres em outro ambiente

A aplicação precisa de um papel com permissão para criar a tabela/índices no primeiro início e ler/escrever solicitações. O MCP precisa de outro papel, sem associação ao papel da aplicação, sem superusuário, criação de banco ou criação de papéis. Conceda USAGE no schema public e SELECT nas tabelas existentes e futuras. Use senhas próprias, fornecidas localmente.

Exemplo de grants, ajustando os papéis ao seu banco:

```sql
GRANT USAGE ON SCHEMA public TO workbot_day5_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO workbot_day5_reader;
ALTER DEFAULT PRIVILEGES FOR ROLE workbot_day5_app IN SCHEMA public
  GRANT SELECT ON TABLES TO workbot_day5_reader;
ALTER ROLE workbot_day5_reader SET default_transaction_read_only = on;
ALTER ROLE workbot_day5_reader SET statement_timeout = '5s';
```

DATABASE_READONLY_URL aponta para esse papel. Não reutilize credenciais de escrita. O MCP não executa a criação do schema; inicie o app ou execute a conferência local antes de consultá-lo.

## Conectar MCPs ao Codex

A configuração está em `.codex/config.toml`, preservando Linear, Figma e GitHub. O `.mcp.json` também está disponível para quem usa Claude Code. Os comandos usam `pnpm exec tsx`, sem banners no stdout do protocolo. Abra o Codex no WSL dentro desta worktree e confira os servidores com `/mcp`; a confiança e as aprovações da ferramenta continuam a cargo do usuário.

Perguntas para conferir o MCP do banco:

- Quantas solicitações existem por equipe? Use workbot_database/query.
- Descreva a tabela requests e suas constraints.
- Leia o recurso db://tables.

Os testes em processo usam Client e InMemoryTransport. A conferência adicional abaixo usa Postgres real e inicia o entrypoint stdio como subprocesso, verifica as três ferramentas e o recurso, e tenta escritas que devem falhar. Ela insere e remove exatamente uma solicitação fictícia.

```bash
pnpm exec tsx scripts/day5-smoke.ts
```

## Configurar PostHog

O projeto PostHog US foi configurado em 05/11/2026: Default project, ID 713446. As chaves estão somente no .env.local ignorado pelo Git. A chave pessoal tem os escopos query:read e event_definition:read, restritos a esse projeto, e expira em 05/12/2026. Para configurar outro ambiente:

1. Crie uma conta e um projeto no PostHog pelo navegador e escolha a região.
2. No `.env.local`, preencha POSTHOG_KEY com a chave de projeto, POSTHOG_PROJECT_ID com o número do projeto e POSTHOG_PERSONAL_KEY com uma chave pessoal de leitura limitada a esse projeto e aos escopos query:read e event_definition:read.
3. Confira os hosts da região. US: https://us.i.posthog.com para captura e https://us.posthog.com para consultas. EU: https://eu.i.posthog.com e https://eu.posthog.com.
4. Reinicie o app e a sessão do MCP para carregar as variáveis.

Não envie chaves pessoais ao cliente, ao Git ou ao chat. O app não usa a chave pessoal; ela serve apenas para consultar o PostHog pelo MCP. Não é necessário publicá-la na Vercel.

## Conferir o funil real

No mesmo navegador, com dados fictícios:

1. Abra /requests/new: request_form_viewed.
2. Envie uma solicitação válida: request_submitted, com requestId e team.
3. Abra seu detalhe: request_viewed, com o mesmo requestId e team.
4. Altere o status: request_status_changed, com requestId, team e status.
5. Confirme os quatro eventos na atividade do projeto PostHog.
6. Pelo MCP, peça os eventos dos últimos dez minutos, confira quais etapas ocorreram e se as propriedades esperadas estão presentes. Se algo faltar, corrija, repita o funil e consulte novamente.
7. Reinicie o app e confira se a solicitação e o status persistiram.

A confirmação com respostas simuladas e coletor local não substitui essa conferência no PostHog real. Também falta comprovar uma pergunta feita pela sua sessão Codex usando o MCP; o handshake automatizado valida o servidor e não essa interação pessoal.

## Verificações

```bash
pnpm test:day5
pnpm check
```

Os testes de solicitações, API e actions usam PGlite em memória. Há testes de persistência em arquivo após reabrir o banco, isolamento de valores SQL, validação de linhas, três ferramentas e recurso do MCP do banco, URLs e paginação do PostHog, filtros de tempo, erros, cookies, privacidade e eventos.

Critérios externos ainda pendentes: consulta pela sessão Codex do usuário, revisão/publicação autorizada e verificação do Dia 5 na aula. A configuração e os testes reais do PostHog estão registrados ao final deste documento. Não marcar a aula como concluída apenas pelos testes locais.

## Referências consultadas

- [MCP TypeScript SDK v1](https://ts.sdk.modelcontextprotocol.io/server)
- [PGlite](https://pglite.dev/docs/api)
- [postgres.js](https://github.com/porsager/postgres)
- [Captura PostHog](https://posthog.com/tutorials/api-capture-events)
- [Eventos PostHog](https://posthog.com/docs/api/events)
- [Definições de eventos](https://posthog.com/docs/api/event-definitions)
- [MCP no Codex](https://learn.chatgpt.com/docs/extend/mcp)

Também foram lidos os guias da versão instalada do Next.js para after, cookies, io, Proxy, Route Handlers e error boundaries. Nesta versão o callback da página de erro se chama retry.

## Resultado da revisão local — 05/11/2026

- `pnpm check` completo aprovado em uma cópia Linux do código: lint, formatação, tipos, **155 testes em 24 arquivos** e build de produção.
- Postgres real: schema e parâmetros conferidos; dados persistiram após reconectar. Escritas, múltiplas instruções e tentativas de alterar privilégios foram rejeitadas pela conexão MCP; o limite de 100 linhas foi confirmado.
- O entrypoint do MCP do banco foi iniciado por um cliente stdio real: três ferramentas e recurso funcionaram. Uma conexão com o papel de escrita da aplicação foi recusada na inicialização.
- Navegador: título com espaços foi rejeitado sem perder detalhes, equipe ou prioridade; envio válido criou o registro; detalhe e mudança de status funcionaram. Após reiniciar o processo Next.js, registro e status continuaram salvos.
- Os quatro eventos do navegador chegaram a um coletor HTTP local e foram consultados pelo entrypoint real do MCP de analytics via stdio. As consultas verificaram nomes, janela de tempo e propriedades. Isso é uma simulação do PostHog, não uma consulta ao serviço real.
- A captura de tela `dia-5-preview.jpg`, na pasta AI-FDE, registra o detalhe persistente após reiniciar.
- As credenciais geradas e o banco local estão ignorados pelo Git. As pastas originais do Dia 4 foram preservadas.

Para repetir a conferência de analytics depois de configurar o PostHog e percorrer o funil:

```bash
pnpm exec tsx scripts/day5-analytics-smoke.ts
```

Não houve publicação. A conclusão da aula continua dependendo de conta/chaves e eventos reais no PostHog, consulta pela sessão Codex e revisão/publicação das entregas.

## PostHog real configurado — 05/11/2026

- Instância US, projeto Default project (713446), plano gratuito.
- Chave de captura, ID e hosts salvos no .env.local; banco preservado.
- Chave pessoal "WorkBot Dia 5 — leitura MCP" criada com autorização do usuário, restrita ao projeto e aos escopos event_definition:read e query:read, com expiração em 05/12/2026. Nenhuma chave foi adicionada a arquivos versionados.
- Autocapture, heatmaps, web vitals automáticos e session replay não foram habilitados. O fluxo usa os quatro eventos explícitos do app.
- Uma solicitação fictícia foi criada no navegador; detalhe e alteração de status funcionaram. Os quatro nomes de evento apareceram na atividade do PostHog real.
- scripts/day5-analytics-smoke.ts concluiu com sucesso contra o PostHog real, usando o entrypoint stdio do MCP: get-event-definitions, check-event-fired e get-events. Foram confirmados os quatro eventos, requestId/team nas etapas posteriores ao formulário e remoção das propriedades internas nas respostas.
- Captura da atividade salva em dia-5-posthog-eventos.jpg na pasta AI-FDE.
- A configuração local está pronta. Não houve publicação do app na Vercel nem conclusão automática da aula. A demonstração pela sessão Codex do usuário pode ser feita com o prompt abaixo após abrir o Codex nesta worktree e conferir /mcp.

```text
Use workbot_posthog para listar os quatro eventos do funil dos últimos dez minutos e conferir requestId, team e status onde se aplicam. Não altere dados nem configurações.
```

O endpoint GET /events/ requer query:read na API atual; a referência anterior a event:read foi corrigida conforme https://posthog.com/docs/api/events.

## Preparação da publicação na Vercel — 05/11/2026

- [PR #21](https://github.com/caadjo/plank-fde-training/pull/21): base do Dia 4 integrada e produção conferida com health, solicitações e políticas respondendo 200.
- [PR #22](https://github.com/caadjo/plank-fde-training/pull/22): Dia 5 enviado, CI aprovado com 155 testes.
- Revisão estática por bug_hunter, performance_reviewer e security_reviewer: SEM ACHADOS no snapshot base 249a01c7efccb0277a4b8cd50fee9a0ffe6e1c7e e head c5bf58ecbfee1b95ea46c0d5cc5bb4ee7625451f. Limitações: sem auditoria do lockfile ou garantia de ausência de defeitos; testes e execuções reais foram feitos separadamente pela sessão principal.
- Pré-publicação: tipos e testes aprovados, variáveis locais presentes e nenhuma chamada console.log em src/.
- O primeiro Verify Day 5 retornou que não havia commits novos na main. Repetir após integrar o PR #22; não considerar essa tentativa uma aprovação.
- O banco cloud e as variáveis foram configurados após essa tentativa; a validação do preview e da produção é a próxima etapa.
