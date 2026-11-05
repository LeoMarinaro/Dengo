import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import { localizedHref, type Locale } from "@/lib/i18n";
import type { GameView } from "@/lib/queries";

export const gamePath = (game: Pick<GameView, "category" | "slug">) => `/jogos/${game.category}/${game.slug}`;

export function Cover({ game, dict, sizes }: { game: GameView; dict: Dictionary; sizes: string }) {
  return (
    <div className="relative aspect-video overflow-hidden bg-tiles">
      {game.cover ? (
        <Image src={game.cover} alt={`${dict.games.screenshotAlt} ${game.title}`} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-clay-500/60">
          <span aria-hidden="true" className="font-display text-6xl font-bold">
            {game.title.charAt(0)}
          </span>
          <span className="text-sm font-semibold">{dict.games.noScreenshot}</span>
        </div>
      )}
    </div>
  );
}

export function GameCard({ game, locale, dict }: { game: GameView; locale: Locale; dict: Dictionary }) {
  return (
    <article className="relative flex w-full flex-col overflow-hidden rounded-3xl border-2 border-clay-500/15 bg-cream-50 shadow-sm transition hover:-translate-y-1 hover:shadow-md motion-reduce:hover:translate-y-0">
      <div className="relative">
        <Cover game={game} dict={dict} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        <span className="absolute top-3 left-3 rounded-full bg-cream-50/95 px-3 py-1 text-xs font-bold tracking-wide text-clay-700 uppercase">
          {dict.games.status[game.status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold text-ink">
          {/* O link cobre o card inteiro (clique em qualquer lugar). */}
          <Link href={localizedHref(locale, gamePath(game))} className="after:absolute after:inset-0">
            {game.title}
          </Link>
        </h3>
        {game.category === "lab" && game.authors.length > 0 && (
          <p className="mt-1 text-sm font-semibold text-leaf-700">
            {dict.games.by} {game.authors.map((a) => a.name).join(", ")}
          </p>
        )}
        <p className="mt-2 flex-1 text-ink-soft">{game.summary[locale]}</p>
        <span aria-hidden="true" className="mt-4 font-display font-semibold text-clay-600">
          {dict.games.seeMore} →
        </span>
      </div>
    </article>
  );
}

export function GameGrid({ games, locale, dict }: { games: GameView[]; locale: Locale; dict: Dictionary }) {
  if (games.length === 0) {
    return <p className="rounded-2xl bg-cream-50 p-6 text-ink-soft">{dict.games.empty}</p>;
  }
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <li key={game.id} className="flex">
          <GameCard game={game} locale={locale} dict={dict} />
        </li>
      ))}
    </ul>
  );
}
