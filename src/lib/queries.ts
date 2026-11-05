import { asc, eq, desc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, hasDatabase, schema } from "@/db";
import type { GameCategory, GameStatus, MemberLink } from "@/db/schema";
import type { Localized } from "@/lib/i18n";

/*
 * Leituras do site público. Ficam em cache até alguém salvar algo no painel,
 * quando as actions chamam updateTag("games") ou updateTag("members").
 */

export const gameCategories: GameCategory[] = ["dengo", "lab"];
export const isGameCategory = (value: string): value is GameCategory =>
  (gameCategories as string[]).includes(value);

export type MediaView ={ id: string; type: "image" | "youtube"; url: string };
export type AuthorView = { slug: string; name: string };

export type GameView = {
  id: string;
  slug: string;
  title: string;
  category: GameCategory;
  status: GameStatus;
  summary: Localized;
  description: Localized;
  itchUrl: string | null;
  /** Primeira imagem da galeria, usada no card. */
  cover: string | null;
  media: MediaView[];
  authors: AuthorView[];
};

export type MemberView = {
  id: string;
  slug: string;
  name: string;
  role: Localized;
  bio: Localized;
  photoUrl: string | null;
  links: MemberLink[];
  position: number;
};

type GameRow = typeof schema.games.$inferSelect & {
  media: (typeof schema.gameMedia.$inferSelect)[];
  authors: { member: typeof schema.members.$inferSelect }[];
};

function toGameView(g: GameRow): GameView {
  const media = [...g.media]
    .sort((a, b) => a.position - b.position)
    .map((m) => ({ id: m.id, type: m.type, url: m.url }));
  return {
    id: g.id,
    slug: g.slug,
    title: g.title,
    category: g.category,
    status: g.status,
    summary: { pt: g.summaryPt, en: g.summaryEn || g.summaryPt },
    description: { pt: g.descriptionPt, en: g.descriptionEn || g.descriptionPt },
    itchUrl: g.itchUrl,
    cover: media.find((m) => m.type === "image")?.url ?? null,
    media,
    authors: g.authors.map((a) => ({ slug: a.member.slug, name: a.member.name })),
  };
}

function toMemberView(m: typeof schema.members.$inferSelect): MemberView {
  return {
    id: m.id,
    slug: m.slug,
    name: m.name,
    role: { pt: m.rolePt, en: m.roleEn || m.rolePt },
    bio: { pt: m.bioPt, en: m.bioEn || m.bioPt },
    photoUrl: m.photoUrl,
    links: m.links,
    position: m.position,
  };
}

const gameWith = { media: true, authors: { with: { member: true } } } as const;

export async function getGames(category: GameCategory): Promise<GameView[]> {
  "use cache";
  cacheLife("max");
  cacheTag("games");
  if (!hasDatabase) return [];

  const rows = await db.query.games.findMany({
    where: eq(schema.games.category, category),
    with: gameWith,
    orderBy: desc(schema.games.createdAt),
  });
  return rows.map(toGameView);
}

export async function getGame(category: string, slug: string): Promise<GameView | null> {
  "use cache";
  cacheLife("max");
  cacheTag("games");
  if (!hasDatabase) return null;

  const row = await db.query.games.findFirst({
    where: eq(schema.games.slug, slug),
    with: gameWith,
  });
  return row && row.category === category ? toGameView(row) : null;
}

export async function getMembers(): Promise<MemberView[]> {
  "use cache";
  cacheLife("hours"); // membros novos (criados pelo script) aparecem em até 1h
  cacheTag("members");
  if (!hasDatabase) return [];

  const rows = await db.query.members.findMany({ orderBy: asc(schema.members.position) });
  return rows.map(toMemberView);
}

export async function getMemberWithGames(
  slug: string,
): Promise<{ member: MemberView; games: GameView[] } | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("members");
  cacheTag("games");
  if (!hasDatabase) return null;

  const row = await db.query.members.findFirst({
    where: eq(schema.members.slug, slug),
    with: { games: { with: { game: { with: gameWith } } } },
  });
  if (!row) return null;
  return {
    member: toMemberView(row),
    games: row.games.map((g) => toGameView(g.game)),
  };
}
