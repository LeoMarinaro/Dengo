/*
 * Gerencia contas de membros pelo terminal (não existe cadastro pelo site).
 *
 *   npm run membro -- criar  --email fulano@email.com --senha "senha-forte" --nome "Fulano" [--posicao 0]
 *   npm run membro -- senha  --email fulano@email.com --senha "nova-senha"
 *   npm run membro -- listar
 *
 * --posicao: lugar na grade da página Equipe (0, 1, 2 = linha de cima; 3, 4, 5 = linha de baixo).
 * Precisa do DATABASE_URL no .env.local (baixe com `vercel env pull .env.local`).
 */

try {
  process.loadEnvFile(".env.local");
} catch {
  // sem .env.local: usa as variáveis de ambiente já definidas
}

import { asc, eq } from "drizzle-orm";
import { parseArgs } from "node:util";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não encontrado. Rode `vercel env pull .env.local` ou crie o .env.local.");
  }

  // Import depois de carregar o .env.local, para a conexão usar o DATABASE_URL certo.
  const { db, schema } = await import("../src/db");
  const { auth } = await import("../src/lib/auth");
  const { slugify } = await import("../src/lib/validation");

  const [command, ...rest] = process.argv.slice(2);
  const { values } = parseArgs({
    args: rest,
    options: {
      email: { type: "string" },
      senha: { type: "string" },
      nome: { type: "string" },
      posicao: { type: "string" },
    },
  });

  if (command === "listar") {
    const members = await db.query.members.findMany({ orderBy: asc(schema.members.position) });
    const users = await db.query.user.findMany();
    for (const m of members) {
      const email = users.find((u) => u.id === m.userId)?.email;
      console.log(`[${m.position}] ${m.name.padEnd(20)} ${email}  /equipe/${m.slug}`);
    }
    if (members.length === 0) console.log("Nenhum membro cadastrado.");
    return;
  }

  if (command === "criar") {
    const { email, senha, nome } = values;
    if (!email || !senha || !nome) throw new Error('Use: criar --email ... --senha ... --nome "..."');

    const { user } = await auth.api.createUser({ body: { email, password: senha, name: nome } });

    let slug = slugify(nome) || "membro";
    for (let i = 2; await db.query.members.findFirst({ where: eq(schema.members.slug, slug) }); i++) {
      slug = `${slugify(nome)}-${i}`;
    }
    const position = values.posicao !== undefined ? Number(values.posicao) : (await db.query.members.findMany()).length;

    await db.insert(schema.members).values({ userId: user.id, name: nome, slug, position });
    console.log(`✔ Membro criado: ${nome} <${email}>  ->  /equipe/${slug}  (posição ${position})`);
    console.log("  Ele aparece na página Equipe em até 1 hora (ou na hora, no próximo deploy).");
    return;
  }

  if (command === "senha") {
    const { email, senha } = values;
    if (!email || !senha) throw new Error("Use: senha --email ... --senha ...");
    if (senha.length < 8) throw new Error("A senha precisa ter pelo menos 8 caracteres.");

    const user = await db.query.user.findFirst({ where: eq(schema.user.email, email.toLowerCase()) });
    if (!user) throw new Error(`Nenhum usuário com o e-mail ${email}.`);

    const ctx = await auth.$context;
    await ctx.internalAdapter.updatePassword(user.id, await ctx.password.hash(senha));
    console.log(`✔ Senha de ${email} atualizada.`);
    return;
  }

  console.log("Comandos: criar, senha, listar. Veja o topo de scripts/membros.ts.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`✘ ${error.message ?? error}`);
    process.exit(1);
  });
