import "server-only";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import type { Member } from "@/db/schema";

/*
 * TODAS as regras de "quem pode mexer em quê" ficam aqui.
 * Regra de ouro: quem está agindo vem SEMPRE da sessão (cookie), nunca de um campo do formulário.
 *
 *  - Perfil: só o dono edita.
 *  - Jogo da Dengo (category "dengo"): qualquer membro edita.
 *  - Jogo do Dengo Lab (category "lab"): só os autores editam.
 */

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Membro logado. Se não houver sessão (ou o usuário não tiver perfil), manda para o login. */
export async function requireMember(loginPath = "/entrar"): Promise<Member> {
  const session = await getSession();
  if (!session) redirect(loginPath);

  const member = await db.query.members.findFirst({
    where: eq(schema.members.userId, session.user.id),
  });
  if (!member) redirect(loginPath);
  return member;
}

export class ForbiddenError extends Error {
  constructor(message = "Você não tem permissão para isso.") {
    super(message);
  }
}

/** Pode editar este jogo? Lança ForbiddenError se não puder. Retorna o jogo. */
export async function assertCanEditGame(member: Member, gameId: string) {
  const game = await db.query.games.findFirst({ where: eq(schema.games.id, gameId) });
  if (!game) throw new ForbiddenError("Jogo não encontrado.");

  if (game.category === "lab" && !(await isAuthor(member.id, gameId))) {
    throw new ForbiddenError("Só os autores podem editar este jogo do Dengo Lab.");
  }
  return game;
}

export async function isAuthor(memberId: string, gameId: string) {
  const row = await db.query.gameAuthors.findFirst({
    where: and(eq(schema.gameAuthors.gameId, gameId), eq(schema.gameAuthors.memberId, memberId)),
  });
  return Boolean(row);
}
