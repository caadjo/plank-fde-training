---
name: pre-deploy
description: Verifica tipos, testes, console.log e variáveis de ambiente do WorkBot antes de uma publicação, sem publicar.
---

# Pre-deploy

- Leia `AGENTS.md`, `.env.example` e `src/lib/config.ts`. Execute na raiz; esta skill somente verifica e nunca publica, faz push ou modifica arquivos de ambiente.
- Carregue `.env.local`, se existir, com o carregador nativo do Node (`--env-file-if-exists=.env.local`), preservando variáveis já definidas no processo. Passe esse ambiente aos comandos abaixo; não use `source`, não imprima valores nem o conteúdo dos arquivos de ambiente. Reporte apenas nomes e presença/ausência.
- Execute `pnpm typecheck` e `pnpm test` separadamente, registrando o resultado de ambos mesmo se um falhar. Use `corepack pnpm` se necessário.
- Execute `rg -n --only-matching 'console\.log\b' src/`. Código 1 significa nenhum resultado; código 2 indica erro de execução. Registre apenas arquivo e linha dos achados, sem imprimir o trecho de código; revise se são chamadas reais. Chamadas reais pendentes bloqueiam o veredito.
- Verifique as variáveis marcadas como obrigatórias em `.env.example` no ambiente carregado: ausentes ou vazias bloqueiam. Respeite as anotações de opcionais e defaults; `VERCEL_ENV` e `VERCEL_GIT_COMMIT_SHA` são opcionais no desenvolvimento. Atualmente não há variáveis obrigatórias. Se `.env.example` faltar ou a classificação for ambígua, reporte a verificação como inconclusiva.
- Apresente uma tabela com verificação, resultado e evidência breve. Veredito **APROVADO** somente se todos os itens passarem; caso contrário, **BLOQUEADO**, com pendências. Isso não autoriza publicação. Nunca publique.
