import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Tabelas do Better Auth (login). Nomes e campos seguem o padrão dele. */
/* ------------------------------------------------------------------ */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // Campos do plugin admin
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Tabelas do site                                                     */
/* ------------------------------------------------------------------ */

export type MemberLink = { label: string; url: string };

/** Perfil público de cada membro. Cada perfil pertence a exatamente um usuário de login. */
export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  /** Parte da URL: /equipe/<slug> */
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  rolePt: text("role_pt").notNull().default(""),
  roleEn: text("role_en").notNull().default(""),
  bioPt: text("bio_pt").notNull().default(""),
  bioEn: text("bio_en").notNull().default(""),
  photoUrl: text("photo_url"),
  links: jsonb("links").$type<MemberLink[]>().notNull().default([]),
  /** Posição na grade da página Equipe (0 a 5). */
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const gameCategory = pgEnum("game_category", ["dengo", "lab"]);
export const gameStatus = pgEnum("game_status", ["prototype", "in-development", "released"]);
export const mediaType = pgEnum("media_type", ["image", "youtube"]);

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Parte da URL: /jogos/<categoria>/<slug> */
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  /** dengo = feito pela Dengo (equipe toda); lab = projeto pessoal, com autores em game_authors. */
  category: gameCategory("category").notNull(),
  status: gameStatus("status").notNull().default("prototype"),
  summaryPt: text("summary_pt").notNull().default(""),
  summaryEn: text("summary_en").notNull().default(""),
  descriptionPt: text("description_pt").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  itchUrl: text("itch_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Autores de jogos do Dengo Lab (um jogo pode ter vários). */
export const gameAuthors = pgTable(
  "game_authors",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.memberId] })],
);

/** Galeria: fotos (enviadas para o Vercel Blob) e vídeos do YouTube. */
export const gameMedia = pgTable("game_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  type: mediaType("type").notNull(),
  /** URL da imagem no Blob, ou o ID do vídeo do YouTube. */
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* Relações (para consultas com `with`) */

export const membersRelations = relations(members, ({ many }) => ({
  games: many(gameAuthors),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  authors: many(gameAuthors),
  media: many(gameMedia),
}));

export const gameAuthorsRelations = relations(gameAuthors, ({ one }) => ({
  game: one(games, { fields: [gameAuthors.gameId], references: [games.id] }),
  member: one(members, { fields: [gameAuthors.memberId], references: [members.id] }),
}));

export const gameMediaRelations = relations(gameMedia, ({ one }) => ({
  game: one(games, { fields: [gameMedia.gameId], references: [games.id] }),
}));

export type Member = typeof members.$inferSelect;
export type Game = typeof games.$inferSelect;
export type GameMedia = typeof gameMedia.$inferSelect;
export type GameCategory = Game["category"];
export type GameStatus = Game["status"];
