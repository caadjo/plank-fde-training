# API

- Preserve route.ts, types.ts e route.test.ts por contrato HTTP.
- Compartilhe o modelo de solicitações; erros internos não são erros de validação 400.
- Health executa SELECT 1 e retorna 503 sem detalhes de conexão quando o banco falha.
- Valide respostas com os schemas nos testes; não exponha entradas privadas ou credenciais.
