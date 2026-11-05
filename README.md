# Dengo Studios: site

Site da Dengo Studios em Next.js 16 + TypeScript + Tailwind, com área de membros.

- **Hospedagem:** Vercel
- **Banco:** Neon (Postgres, adicionado pelo Marketplace da Vercel)
- **Login:** Better Auth (e-mail e senha, sem cadastro público)
- **Fotos:** Vercel Blob
- **Idiomas:** português em `/`, inglês em `/en`

## Colocar no ar (uma vez só)

1. Suba o repositório no GitHub e importe o projeto na [Vercel](https://vercel.com/new).
2. No projeto da Vercel, aba **Storage**:
   - **Create Database → Neon**. Isso cria o `DATABASE_URL`.
   - **Create → Blob**. Isso cria o `BLOB_READ_WRITE_TOKEN`.
3. Em **Settings → Environment Variables**, adicione:
   - `BETTER_AUTH_SECRET`: uma senha longa e aleatória. Gere com `npx @better-auth/cli secret` ou `openssl rand -base64 32`.
   - `BETTER_AUTH_URL`: o endereço do site (ex.: `https://dengostudios.com`).
4. No seu computador, baixe as variáveis e crie as tabelas:
   ```bash
   npm i -g vercel
   vercel link
   vercel env pull .env.local
   npm run db:push
   ```
5. Crie as contas dos membros (veja abaixo) e faça um novo deploy.

## Membros

Não existe cadastro pelo site. As contas são criadas pelo terminal, com o `.env.local` apontando para o banco:

```bash
# criar (posição 0-2 = linha de cima da tela Equipe, 3-5 = linha de baixo)
npm run membro -- criar --email fulano@email.com --senha "senha-forte" --nome "Fulano" --posicao 0

# trocar a senha de alguém
npm run membro -- senha --email fulano@email.com --senha "nova-senha"

# ver quem está cadastrado
npm run membro -- listar
```

Depois é só passar o e-mail e a senha para a pessoa. Ela entra em **/entrar** (link "Área de membros" no rodapé) e edita o próprio perfil e os jogos no **/painel**.

## Quem pode editar o quê

| O quê | Quem |
|---|---|
| Perfil | Só o dono |
| Jogos da Dengo | Qualquer membro |
| Jogos do Dengo Lab | Só os autores do jogo (pode ter vários) |

As regras ficam em [src/lib/permissions.ts](src/lib/permissions.ts) e são checadas em todas as ações de [src/lib/actions.ts](src/lib/actions.ts).

## Desenvolvimento

```bash
npm install
npm run dev          # http://localhost:3000
npm run db:studio    # ver e editar o banco no navegador
```

Sem `.env.local` o site roda, mas as listas de jogos e da equipe ficam vazias e o login não funciona.

## Onde fica cada coisa

| Caminho | O quê |
|---|---|
| `src/app/[lang]/` | Páginas (Home, jogos, equipe, entrar, painel) |
| `src/dictionaries/` | Textos fixos do site em PT e EN |
| `src/data/site.ts` | E-mail de contato e redes sociais |
| `src/db/schema.ts` | Tabelas do banco |
| `src/lib/auth.ts` | Configuração do login |
| `src/lib/queries.ts` | Leituras do site público (com cache) |
| `src/lib/actions.ts` | Tudo que o painel salva |
| `scripts/membros.ts` | Criar membros e trocar senhas |
