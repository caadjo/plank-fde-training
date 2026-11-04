# Atualização de status — WOR-19

## Integração após o merge do detalhe

Na página `/requests/[id]`, dentro do componente que já leu a solicitação e tratou ID inexistente, importe:

```tsx
import { RequestStatusControls } from "@/components/request-status-controls";
```

Adicione junto aos dados do detalhe, fora de qualquer outro formulário:

```tsx
<RequestStatusControls request={request} />
```

Nenhuma página de detalhe é criada nesta entrega. A leitura deve continuar dinâmica, aguardando `io()` no store e sob `Suspense` na página.

## Contrato e limites

`updateRequestStatus(id, status)` valida UUID e o enum do schema compartilhado antes de escrever. Retorna uma cópia do registro ou `null` para UUID inexistente, sem inserir registros. Todos os campos atuais são escalares, portanto a cópia rasa isola as referências. São permitidas transições entre quaisquer status, inclusive reabrir e repetir o status atual.

`updateRequestStatusAction` trata os argumentos de `bind` como não confiáveis e valida novamente na fronteira pública. Falhas de validação ou ID inexistente lançam erro, sem invalidar nem chamar `refresh()`. Falhas internas também propagam. Após sucesso, invalida detalhe, `/requests` e `/admin` e chama `refresh()` para atualizar a rota atual. `refresh()` sozinho não invalida cache; as leituras atuais usam armazenamento dinâmico sem cache de dados.

Validar formato e existência não autentica o usuário nem autoriza acesso ao registro. Esta etapa não tem autenticação, autorização, política de transições ou controle de concorrência; a última escrita vence. O armazenamento é fictício, temporário, local ao processo e sem durabilidade entre instâncias.

Os testes cobrem store e ação com cache simulado e a renderização dos controles com estado pendente simulado. Não comprovam uma submissão real, o transporte de Server Actions ou o refresh no navegador. Essa verificação deve acontecer após conectar a página de detalhe.
