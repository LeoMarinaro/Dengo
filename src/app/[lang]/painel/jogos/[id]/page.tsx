import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { GalleryManager } from "@/components/painel/GalleryManager";
import { GameForm } from "@/components/painel/GameForm";
import { DeleteGameButton } from "@/components/painel/DeleteGameButton";
import { Card } from "@/components/painel/ui";
import { db, schema } from "@/db";
import { getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";
import { assertCanEditGame, ForbiddenError, requireMember } from "@/lib/permissions";

type Props = PageProps<"/[lang]/painel/jogos/[id]">;

export default function EditGamePage({ params }: Props) {
  return (
    <Suspense fallback={<p className="text-ink-soft">Carregando...</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function Editor({ params }: Pick<Props, "params">) {
  const { id } = await params;
  const locale = await getLocale();
  const member = await requireMember(localizedHref(locale, "/entrar"));
  const back = localizedHref(locale, "/painel/jogos");

  let game;
  try {
    if (!UUID.test(id)) throw new ForbiddenError("Jogo não encontrado.");
    game = await assertCanEditGame(member, id);
  } catch (error) {
    if (!(error instanceof ForbiddenError)) throw error;
    return (
      <Card>
        <p role="alert" className="font-semibold text-red-900">{error.message}</p>
        <Link href={back} className="mt-4 inline-block font-semibold text-clay-600 underline">
          Voltar para a lista
        </Link>
      </Card>
    );
  }

  const [media, authors, allMembers] = await Promise.all([
    db.query.gameMedia.findMany({ where: eq(schema.gameMedia.gameId, id), orderBy: asc(schema.gameMedia.position) }),
    db.query.gameAuthors.findMany({ where: eq(schema.gameAuthors.gameId, id) }),
    db.query.members.findMany({ orderBy: asc(schema.members.position), columns: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={back} className="font-display font-semibold text-clay-600 hover:text-clay-700">
          ← Todos os jogos
        </Link>
        <Link
          href={localizedHref(locale, `/jogos/${game.category}/${game.slug}`)}
          className="font-display font-semibold text-clay-600 underline underline-offset-4 hover:text-clay-700"
        >
          Ver página pública
        </Link>
      </div>

      <p className="text-ink-soft">
        {game.category === "dengo" ? "Jogo da Dengo (qualquer membro pode editar)" : "Projeto do Dengo Lab (só os autores podem editar)"}
      </p>

      <GameForm
        gameId={game.id}
        initial={{
          title: game.title,
          status: game.status,
          itchUrl: game.itchUrl ?? "",
          summaryPt: game.summaryPt,
          summaryEn: game.summaryEn,
          descriptionPt: game.descriptionPt,
          descriptionEn: game.descriptionEn,
        }}
        authors={
          game.category === "lab"
            ? { all: allMembers, selected: authors.map((a) => a.memberId), currentMemberId: member.id }
            : null
        }
      />

      <GalleryManager gameId={game.id} media={media.map((m) => ({ id: m.id, type: m.type, url: m.url }))} />

      <Card title="Zona de perigo">
        <DeleteGameButton gameId={game.id} title={game.title} redirectTo={back} />
      </Card>
    </div>
  );
}
