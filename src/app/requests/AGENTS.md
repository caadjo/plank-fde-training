# Rotas de solicitações

- Preserve `/requests`, `/requests/new` e `/requests/[id]` no App Router.
- Aguarde params/searchParams e leituras dinâmicas sob Suspense; IDs ausentes usam notFound.
- Filtros de equipe e status ficam na URL e reutilizam o parser compartilhado.
- O detalhe inclui RequestStatusControls; a action valida argumentos e invalida detalhe, lista e admin.
- Preserve os valores do formulário em erros e confira o fluxo completo no navegador.
