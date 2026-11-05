import { desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { NewGameForm } from "@/components/painel/NewGameForm";
import { Card } from "@/components/painel/ui";
import { db, schema } from "@/db";
import type { Game } from "@/db/schema";
import { getLocale } from "@/lib/dictionaries";
import { localizedHref, type Locale } from "@/lib/i18n";
import { requireMember } from "@/lib/permissions";

export default function PainelJogosPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Carregando...</p>}>
      <GamesList />
    </Suspense>
  );
}

async function GamesList() {
  const locale = await getLocale();
  const member = await requireMember(localizedHref(locale, "/entrar"));

  // Jogos da Dengo: todos. Jogos do Lab: só os que a pessoa é autora.
  const dengoGames = await db.query.games.findMany({
    where: eq(schema.games.category, "dengo"),
    orderBy: desc(schema.games.updatedAt),
  });
  const myLabIds = (
    await db.query.gameAuthors.findMany({ where: eq(schema.gameAuthors.memberId, member.id) })
  ).map((a) => a.gameId);
  const labGames = myLabIds.length
    ? await db.query.games.findMany({ where: inArray(schema.games.id, myLabIds), orderBy: desc(schema.games.updatedAt) })
    : [];

  return (
    <div className="space-y-6">
      <Card title="Novo jogo">
        <NewGameForm editPath={localizedHref(locale, "/painel/jogos")} />
      </Card>
      <Card title="Jogos da Dengo">
        <p className="-mt-3 mb-4 text-sm text-ink-soft">Qualquer membro pode editar.</p>
        <GameList games={dengoGames} locale={locale} empty="Nenhum jogo da Dengo cadastrado ainda." />
      </Card>
      <Card title="Meus jogos do Dengo Lab">
        <p className="-mt-3 mb-4 text-sm text-ink-soft">Projetos em que você é autor(a). Só os autores podem editar.</p>
        <GameList games={labGames} locale={locale} empty="Você ainda não tem projetos no Dengo Lab." />
      </Card>
    </div>
  );
}

function GameList({ games, locale, empty }: { games: Game[]; locale: Locale; empty: string }) {
  if (games.length === 0) return <p className="text-ink-soft">{empty}</p>;
  return (
    <ul className="divide-y-2 divide-clay-500/10">
      {games.map((g) => (
        <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <span className="font-display text-lg font-semibold text-ink">{g.title}</span>
          <Link
            href={localizedHref(locale, `/painel/jogos/${g.id}`)}
            className="rounded-full border-2 border-clay-500/40 px-4 py-1.5 font-display font-semibold text-clay-700 hover:border-clay-500 hover:bg-cream-200"
          >
            Editar <span className="sr-only">{g.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
