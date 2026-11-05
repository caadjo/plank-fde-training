# Modelo de solicitações

- request-model.ts concentra contratos Zod e rótulos sem dependências do servidor.
- requests.ts concentra SQL; schema.ts e store.ts nesta pasta preservam imports anteriores.
- Preserve createRequest, getRequest, updateRequestStatus e listRequests com filtros combináveis.
- Valide entradas antes de escrever e aguarde io() antes de leituras dinâmicas.
- Use parâmetros SQL e valide cada linha retornada pelo schema compartilhado.
- Testes usam PGlite em memória, sem acesso a bancos de desenvolvimento ou produção.
