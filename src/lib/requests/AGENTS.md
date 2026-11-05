# Modelo de solicitações

- schema.ts concentra contratos Zod e rótulos; filters.ts interpreta os parâmetros da URL.
- Preserve createRequest, getRequest, updateRequestStatus e listRequests com filtros opcionais combináveis.
- Valide entradas antes de escrever e aguarde io() antes de acessar o armazenamento.
- Retorne cópias defensivas e mantenha a ordenação da lista da mais recente para a mais antiga.
- O armazenamento global é temporário e local ao processo; use somente dados fictícios.
- Teste a atualização de status junto à consulta por ID e aos filtros combinados.
