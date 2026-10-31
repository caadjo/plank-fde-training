---
name: component
description: Cria um componente React e seu teste no WorkBot a partir do nome e do comportamento solicitado.
---

# Component

- Receba o nome e o comportamento; pergunte somente o que faltar para implementar. Leia `AGENTS.md`, `src/components/site-header.tsx` e `src/components/site-header.test.tsx`.
- Converta o nome para kebab-case no arquivo e PascalCase na exportação nomeada. Crie `src/components/<kebab-name>.tsx` e `<kebab-name>.test.tsx` ao lado, sem sobrescrever componentes existentes sem solicitação.
- Reutilize os componentes disponíveis em `src/components/ui/` e `cn` de `@/lib/utils` quando necessário. Preserve HTML semântico, nomes acessíveis, foco visível e responsividade. Use Server Components por padrão.
- Importe por caminho com `@/`; não crie barrel files (`index.ts`).
- Use Vitest com imports explícitos e `renderToStaticMarkup` de `react-dom/server`, como no teste do cabeçalho. Verifique conteúdo, links e atributos relevantes ao comportamento; renderização estática não comprova interação. Se houver interação, cubra-a com ferramenta apropriada conforme o escopo solicitado.
- Execute o teste criado e `pnpm check`. Informe arquivos alterados e resultados.
