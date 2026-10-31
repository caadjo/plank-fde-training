---
name: api-route
description: Cria uma rota HTTP no App Router do WorkBot com schemas Zod, tipos inferidos e testes por método.
---

# API route

- Receba o nome da rota e os métodos HTTP. Confirme o contrato de entrada, saída e persistência quando não estiver definido; não invente banco ou armazenamento. Leia `AGENTS.md`, `src/app/api/health/route.ts`, a configuração do Vitest e o guia local de Route Handlers em `node_modules/next/dist/docs/`.
- Crie `types.ts`, `route.ts` e `route.test.ts` em `src/app/api/<nome>/`. Inspecione arquivos existentes antes de alterá-los; exporte em `route.ts` somente os métodos solicitados e as configurações permitidas pelo Next.js.
- Use Zod: se ausente, instale com `pnpm add zod`, mantendo o lockfile. Defina schemas em `types.ts` e derive os tipos com `z.infer`; não duplique interfaces dos schemas.
- Valide entradas externas (body, query e parâmetros aplicáveis) com `safeParse`. Trate JSON malformado e falha de validação como HTTP 400; não converta erros internos em 400. Retorne 404 para recurso ausente e 409 para conflito, quando o contrato envolver esses casos. Use respostas JSON sem expor segredos ou detalhes internos.
- Nas respostas 400 por falha de validação, preserve a mensagem de erro e inclua `issues` com os detalhes do Zod (`code`, `path`, `message`). Selecione esses campos explicitamente; não exponha `input`, valores recebidos ou mensagens que os reproduzam. Mantenha JSON malformado com tratamento separado e não converta erros internos em 400.
- Em `route.test.ts`, importe os handlers diretamente e invoque-os com `Request`/`NextRequest` e contexto quando necessário. Cubra sucesso por método, entradas inválidas por método que aceite dados, JSON malformado quando aplicável e os casos 404/409 implementados. Confira status, body, campos inválidos e seus problemas em `issues`, ausência de valores recebidos e propagação de erros internos; isole dependências externas e o estado entre testes.
- Execute os testes da rota e `pnpm check`. Informe o contrato, os arquivos e os resultados.
