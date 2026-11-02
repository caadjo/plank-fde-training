# Integrações do Dia 3 no Codex (WSL)

O Codex usa `.codex/config.toml` neste projeto confiável, em vez do `.mcp.json` usado pelo Claude Code na aula. A configuração contém somente URLs e o nome de uma variável; não contém tokens.

## Autenticar

No WSL, abra a pasta do projeto e execute um comando por vez:

```bash
cd /mnt/c/Users/caiov/OneDrive/Documentos/ai-fde-training/plank-fde-training
codex mcp login linear
codex mcp login figma
```

Em cada navegador aberto, confira a conta e as permissões e conclua o login. A sessão de preparação não aceita esses acessos em seu nome. Se o navegador não abrir no WSL, abra a URL exibida pelo comando. Não envie URLs de callback, códigos ou tokens para o chat.

Para o GitHub, a configuração espera `GITHUB_MCP_TOKEN` no ambiente do processo Codex. O servidor remoto documenta autenticação por token para Codex. Use um token autorizado para este repositório; o token não precisa ser salvo em arquivo. Para aproveitar o login já feito no GitHub CLI, execute no próprio terminal, sem imprimir o resultado:

```bash
export GITHUB_MCP_TOKEN="$(gh auth token)"
codex mcp list
codex
```

Não use `echo`, não cole o valor do token em prompts e não o adicione a `.env.example`. A variável vale para esse terminal e seus processos filhos. Se o token do CLI não for aceito pelo servidor MCP, configurar um PAT com acesso mínimo ao repositório, usando a documentação oficial, em vez de ampliar permissões indiscriminadamente.

## Conferir o resultado

Dentro do Codex, execute `/mcp`. A existência dos servidores na lista não comprova que o login ou uma consulta funcionou.

Peça:

1. “Leia os critérios de aceite de WOR-9 no Linear. Não altere o ticket.”
2. “Leia o frame https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-297 e descreva os campos. Não altere o arquivo.”
3. “Leia o diff do PR 1 de caadjo/plank-fde-training pelo MCP do GitHub. Não publique comentários.”

Registre êxito somente após obter conteúdo real dos três serviços. A criação do backlog por navegador e o uso do plugin Figma nesta conversa não substituem o teste da integração do WSL.

## Referências de design

| Ticket          | Tela             | Frame                                                             |
| --------------- | ---------------- | ----------------------------------------------------------------- |
| WOR-11          | Nova solicitação | https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-297 |
| WOR-10          | Lista            | https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-354 |
| WOR-13 e WOR-14 | Admin e overview | https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-388 |
| WOR-15          | Configurações    | https://www.figma.com/design/NGnZLC2fN2YKU0dTnVIc0L?node-id=3-427 |

Telas editáveis, com componentes de formulário da Simple Design System. O código usa Arial/Helvetica; essas fontes não estavam disponíveis na integração Figma, então a referência usa Inter como aproximação. Preservar a fonte do código.

## Fontes

- Codex: https://learn.chatgpt.com/docs/extend/mcp
- Linear: https://linear.app/docs/mcp
- Figma: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- GitHub/Codex: https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-codex.md
