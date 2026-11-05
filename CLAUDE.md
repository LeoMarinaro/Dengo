# Dengo Studios — Site

## Goal
Construir o site da Dengo Studios, empresa de jogos (minha e dos meus amigos).

## Stack
- Next.js (App Router) com React
- TypeScript throughout
- Tailwind CSS, responsive design, accessibility
- Sem banco de dados por enquanto (conteúdo em arquivos de dados no repo)
- Português (padrão, em `/`) e Inglês (em `/en`) via next-intl
- Código no GitHub, deploy na Vercel

## Estrutura do Site
- **Home**
- **Jogos**, dividido em duas categorias:
  - **Dengo Studios**: jogos feitos pela equipe toda
  - **Dengo Lab**: projetos pessoais de cada membro
- **Equipe**
- **Contato**: fica sempre no rodapé de todas as páginas (não é página separada)

## Layout das páginas (decidido com o usuário, um por vez)
- **Cabeçalho**: logo · Início · Jogos · Equipe · PT|EN
- **Home**, de cima para baixo:
  1. Sobre nós: imagem da Dengo + texto (o texto o usuário ainda vai mandar)
  2. Cards com jogos feitos pela Dengo (estúdio)
  3. Cards do Dengo Lab
  4. Contato no rodapé
- **Jogos**: Dengo Studios e Dengo Lab têm páginas separadas. No cabeçalho, "Jogos" é um menu suspenso com as duas opções
- **Equipe**: homenagem à tela de seleção de fase dos Mega Man antigos: grade com o "retrato de boss" de cada membro, cada um com link para a pessoa. Usar só arte própria (nada de personagens, sprites ou músicas da Capcom)
  - Grade 3x3: logo da Dengo no centro, mascote nos dois espaços laterais do centro (imagem do mascote virá depois), os 6 membros nas linhas de cima e de baixo
  - Cada retrato leva para a página própria do membro (`/equipe/<nome>`); layout dessa página: a definir
  - Fotos dos membros virão depois; até lá, usar espaços reservados
- A equipe quer espalhar outras homenagens desse tipo (referências a jogos clássicos) em outras partes do site

## Área de membros (login) — implementado (ver README para deploy)
- Aba de login; depois de logar, a pessoa cai na própria área e edita o próprio perfil
- Stack decidida: **Neon** (Postgres via Vercel Marketplace) + **Better Auth** (login no nosso código) + **Vercel Blob** (fotos). Tudo gerenciado pelo painel da Vercel. Supabase foi considerado e descartado
- Permissões ficam no código, centralizadas em um arquivo; nunca confiar em ids vindos do formulário, sempre na sessão
- Criação de membros: por script (`npm run criar-membro`); tela de admin talvez depois
- Perfil editável: nome, função, bio, foto, links
- Jogos editáveis: jogos gerais (Dengo Studios) e jogos do Dengo Lab
- Jogo tem: descrição, galeria (fotos e vídeos), link, e autoria:
  - jogo geral: feito pela Dengo
  - jogo do Dengo Lab: um ou mais membros como autores
- Jogos e equipe vêm do banco (`src/lib/queries.ts`, com `'use cache'` + tags `games`/`members`; actions chamam `updateTag`)
- Rotas: `/entrar` (login), `/painel` (perfil), `/painel/jogos`, `/painel/jogos/<id>`. Painel só em português
- Env vars: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Server Actions de upload: 1 imagem por requisição, até 4 MB (`serverActions.bodySizeLimit`)
- Para testar localmente sem Neon dá pra usar PGlite (`@electric-sql/pglite-socket`) como Postgres em memória
- Login: e-mail e senha. Sem cadastro público: os usuários são criados direto no banco e o login/senha é repassado a cada membro
- Permissões: perfil, só o dono edita. Jogos gerais (Dengo), qualquer membro edita. Jogos do Lab, só os autores
- Galeria: fotos com upload; vídeos por link do YouTube (embed)

## Rotas e onde editar
- `/` Home · `/jogos/dengo` e `/jogos/lab` listas · `/jogos/<categoria>/<slug>` página do jogo (screenshot + descrição maior) · `/equipe` seleção · `/equipe/<id>` membro (provisória)
- Inglês: mesmas rotas com `/en` na frente. i18n nativo do Next 16 (`next/root-params` + `src/proxy.ts`), sem biblioteca
- Textos fixos: `src/dictionaries/pt.json` e `en.json`. Contato/redes: `src/data/site.ts`
- Next 16.4 com Cache Components: todo `generateStaticParams` precisa retornar pelo menos 1 item. Rotas de jogo/membro não têm generateStaticParams: `await params` fica dentro de `<Suspense>`, e por isso `usePathname()` (menu, idioma, abas) também fica em Suspense

## Conteúdo pendente
- Cada membro cadastra o próprio perfil e os jogos pelo painel
- Imagem do mascote (usuário vai mandar)
- Layout da página do membro: a definir
- Texto do Sobre nós cita "quatro desenvolvedores" e "dois títulos lançados": confirmar com a equipe

## Conteúdo
- Os jogos atuais são protótipos publicados no itch.io
- Logo: `Imagens/DengoLogo.jfif`, um "D" de barro em formato de filtro de barro. Paleta: terracota, laranja, creme, com detalhes em verde (folhas)
