# Modelo de solicitações — WOR-9

Ticket: https://linear.app/workbot/issue/WOR-9/modelo-de-solicitacoes

## Contrato

- Título obrigatório, com trim e 3–120 caracteres.
- Detalhes opcionais, com trim, até 5.000 caracteres; default vazio.
- Equipes: operations, finance, support; default operations.
- Prioridades: low, medium, high; default medium.
- ID UUID, status new e createdAt ISO são gerados pelo servidor. Campos adicionais são rejeitados.
- createRequest valida antes de alterar o estado.
- listRequests retorna cópias, em ordem inversa de criação, incluindo empates de timestamp.
- O armazenamento globalThis é temporário e compartilhado apenas dentro do mesmo processo. Não oferece durabilidade nem compartilhamento entre instâncias.

## Validação

Testes cobrem trim, defaults, limites, enums, campos controlados pelo servidor, ausência de efeitos em entradas inválidas, ordem e isolamento de referências.
