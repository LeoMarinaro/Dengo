import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local"); // DATABASE_URL baixado com `vercel env pull .env.local`
} catch {
  // sem .env.local: usa as variáveis de ambiente já definidas
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Só mexe no esquema "public". O Neon cria o esquema "neon_auth" sozinho; ele não é nosso.
  schemaFilter: ["public"],
  // Conexão direta (sem pooler) é a recomendada pelo Neon para criar/alterar tabelas.
  dbCredentials: { url: (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL)! },
});
