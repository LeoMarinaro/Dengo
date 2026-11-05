import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db, schema } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    // Ninguém se cadastra pelo site: contas são criadas com `npm run criar-membro`.
    disableSignUp: true,
    minPasswordLength: 8,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 dias logado
  },

  plugins: [
    admin(), // permite criar usuários pelo script
    nextCookies(), // precisa ser o último: grava o cookie de sessão nas Server Actions
  ],
});

export type Session = typeof auth.$Infer.Session;
