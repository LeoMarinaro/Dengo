"use server";

import { del, put } from "@vercel/blob";
import { asc, eq, inArray, max } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db, schema } from "@/db";
import type { GameCategory, GameStatus, MemberLink } from "@/db/schema";
import { assertCanEditGame, ForbiddenError, requireMember } from "@/lib/permissions";
import { checkImage, cleanUrl, parseYouTubeId, slugify, text } from "@/lib/validation";

/*
 * Tudo o que o painel salva passa por aqui.
 * Cada action começa com requireMember() (quem está logado) e,
 * quando mexe em jogo, assertCanEditGame() (pode mexer neste jogo?).
 */

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

const STATUSES: GameStatus[] = ["prototype", "in-development", "released"];
const CATEGORIES: GameCategory[] = ["dengo", "lab"];

/** Executa a action e transforma erros esperados em mensagem para o formulário. */
async function run(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ForbiddenError) return { ok: false, error: error.message };
    // redirect()/notFound() do Next funcionam lançando erros: precisam continuar subindo.
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error(error);
    return { ok: false, error: "Algo deu errado. Tente de novo em instantes." };
  }
}

async function uploadImage(folder: string, file: File) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new ForbiddenError("Envio de imagens ainda não configurado (falta o Vercel Blob).");
  }
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const blob = await put(`${folder}/imagem.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });
  return blob.url;
}

async function deleteBlob(url: string | null | undefined) {
  if (!url || !url.includes(".blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch (error) {
    console.error("Falha ao apagar imagem antiga do Blob", error);
  }
}

async function uniqueGameSlug(title: string) {
  const base = slugify(title) || "jogo";
  let slug = base;
  for (let i = 2; ; i++) {
    const taken = await db.query.games.findFirst({ where: eq(schema.games.slug, slug) });
    if (!taken) return slug;
    slug = `${base}-${i}`;
  }
}

/* ------------------------------ Perfil ------------------------------ */

export async function updateProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const member = await requireMember();

    const name = text(formData, "name", 80);
    if (!name) return { ok: false, error: "O nome não pode ficar vazio." };

    const labels = formData.getAll("linkLabel").map(String);
    const urls = formData.getAll("linkUrl").map(String);
    const links: MemberLink[] = [];
    for (let i = 0; i < Math.min(labels.length, urls.length, 10); i++) {
      const label = labels[i].trim().slice(0, 40);
      if (!label && !urls[i].trim()) continue;
      const url = cleanUrl(urls[i]);
      if (!label || !url) return { ok: false, error: `Link ${i + 1}: preencha o nome e um endereço válido (https://...).` };
      links.push({ label, url });
    }

    let photoUrl = member.photoUrl;
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      const problem = checkImage(photo);
      if (problem) return { ok: false, error: problem };
      photoUrl = await uploadImage(`membros/${member.id}`, photo);
      await deleteBlob(member.photoUrl);
    }

    await db
      .update(schema.members)
      .set({
        name,
        rolePt: text(formData, "rolePt", 80),
        roleEn: text(formData, "roleEn", 80),
        bioPt: text(formData, "bioPt", 2000),
        bioEn: text(formData, "bioEn", 2000),
        links,
        photoUrl,
        updatedAt: new Date(),
      })
      // O id vem da sessão, nunca do formulário: só dá pra editar o próprio perfil.
      .where(eq(schema.members.id, member.id));

    updateTag("members");
    updateTag("games"); // nomes dos autores aparecem nos jogos
    return { ok: true, message: "Perfil salvo!" };
  });
}

/* ------------------------------ Jogos ------------------------------ */

export async function createGame(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const member = await requireMember();

    const title = text(formData, "title", 100);
    const category = text(formData, "category") as GameCategory;
    if (!title) return { ok: false, error: "Dê um nome para o jogo." };
    if (!CATEGORIES.includes(category)) return { ok: false, error: "Escolha se é um jogo da Dengo ou do Dengo Lab." };

    const [game] = await db
      .insert(schema.games)
      .values({ title, category, slug: await uniqueGameSlug(title) })
      .returning({ id: schema.games.id });

    // Jogo do Lab nasce com quem criou como autor.
    if (category === "lab") {
      await db.insert(schema.gameAuthors).values({ gameId: game.id, memberId: member.id });
    }

    updateTag("games");
    return { ok: true, id: game.id };
  });
}

export async function updateGame(gameId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const member = await requireMember();
    const game = await assertCanEditGame(member, gameId);

    const title = text(formData, "title", 100);
    if (!title) return { ok: false, error: "O nome do jogo não pode ficar vazio." };

    const status = text(formData, "status") as GameStatus;
    if (!STATUSES.includes(status)) return { ok: false, error: "Status inválido." };

    const itchRaw = text(formData, "itchUrl", 300);
    const itchUrl = itchRaw ? cleanUrl(itchRaw) : null;
    if (itchRaw && !itchUrl) return { ok: false, error: "O link do itch.io precisa ser um endereço válido (https://...)." };

    if (game.category === "lab") {
      const authorIds = [...new Set(formData.getAll("authors").map(String))];
      if (authorIds.length === 0) return { ok: false, error: "Um jogo do Dengo Lab precisa de pelo menos um autor." };

      const valid = await db.query.members.findMany({ where: inArray(schema.members.id, authorIds) });
      if (valid.length !== authorIds.length) return { ok: false, error: "Autor inválido." };

      await db.delete(schema.gameAuthors).where(eq(schema.gameAuthors.gameId, gameId));
      await db.insert(schema.gameAuthors).values(authorIds.map((memberId) => ({ gameId, memberId })));
    }

    await db
      .update(schema.games)
      .set({
        title,
        status,
        itchUrl,
        summaryPt: text(formData, "summaryPt", 200),
        summaryEn: text(formData, "summaryEn", 200),
        descriptionPt: text(formData, "descriptionPt", 10000),
        descriptionEn: text(formData, "descriptionEn", 10000),
        updatedAt: new Date(),
      })
      .where(eq(schema.games.id, gameId));

    updateTag("games");
    return { ok: true, message: "Jogo salvo!" };
  });
}

export async function deleteGame(gameId: string): Promise<ActionResult> {
  return run(async () => {
    const member = await requireMember();
    await assertCanEditGame(member, gameId);

    const media = await db.query.gameMedia.findMany({ where: eq(schema.gameMedia.gameId, gameId) });
    await db.delete(schema.games).where(eq(schema.games.id, gameId));
    await Promise.all(media.filter((m) => m.type === "image").map((m) => deleteBlob(m.url)));

    updateTag("games");
    return { ok: true };
  });
}

/* ------------------------------ Galeria ------------------------------ */

async function nextPosition(gameId: string) {
  const [row] = await db
    .select({ value: max(schema.gameMedia.position) })
    .from(schema.gameMedia)
    .where(eq(schema.gameMedia.gameId, gameId));
  return (row?.value ?? -1) + 1;
}

/** Envia UMA imagem (o formulário manda uma por vez, por causa do limite de 4 MB). */
export async function addGameImage(gameId: string, formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const member = await requireMember();
    await assertCanEditGame(member, gameId);

    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Escolha uma imagem." };
    const problem = checkImage(file);
    if (problem) return { ok: false, error: `${file.name}: ${problem}` };

    const url = await uploadImage(`jogos/${gameId}`, file);
    await db.insert(schema.gameMedia).values({ gameId, type: "image", url, position: await nextPosition(gameId) });

    updateTag("games");
    return { ok: true };
  });
}

export async function addGameVideo(gameId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const member = await requireMember();
    await assertCanEditGame(member, gameId);

    const videoId = parseYouTubeId(text(formData, "youtube", 300));
    if (!videoId) return { ok: false, error: "Não reconheci esse link do YouTube." };

    await db
      .insert(schema.gameMedia)
      .values({ gameId, type: "youtube", url: videoId, position: await nextPosition(gameId) });

    updateTag("games");
    return { ok: true, message: "Vídeo adicionado!" };
  });
}

async function findMediaForEdit(mediaId: string) {
  const member = await requireMember();
  const media = await db.query.gameMedia.findFirst({ where: eq(schema.gameMedia.id, mediaId) });
  if (!media) throw new ForbiddenError("Item da galeria não encontrado.");
  await assertCanEditGame(member, media.gameId);
  return media;
}

export async function removeGameMedia(mediaId: string): Promise<ActionResult> {
  return run(async () => {
    const media = await findMediaForEdit(mediaId);
    await db.delete(schema.gameMedia).where(eq(schema.gameMedia.id, mediaId));
    if (media.type === "image") await deleteBlob(media.url);

    updateTag("games");
    return { ok: true };
  });
}

/** Troca o item de lugar com o vizinho (para cima = -1, para baixo = +1). */
export async function moveGameMedia(mediaId: string, direction: -1 | 1): Promise<ActionResult> {
  return run(async () => {
    const media = await findMediaForEdit(mediaId);
    const siblings = await db.query.gameMedia.findMany({
      where: eq(schema.gameMedia.gameId, media.gameId),
      orderBy: asc(schema.gameMedia.position),
    });

    const index = siblings.findIndex((m) => m.id === mediaId);
    const target = siblings[index + direction];
    if (!target) return { ok: true };

    // Reescreve as posições em sequência (0, 1, 2...) já com a troca feita.
    const reordered = [...siblings];
    [reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]];
    await Promise.all(
      reordered.map((m, position) =>
        db.update(schema.gameMedia).set({ position }).where(eq(schema.gameMedia.id, m.id)),
      ),
    );

    updateTag("games");
    return { ok: true };
  });
}
