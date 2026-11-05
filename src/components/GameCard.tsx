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

/*
 * Card em forma de cartucho (desenho próprio, genérico): ranhuras no topo,
 * rótulo com a screenshot e conectores embaixo. Dengo = barro, Lab = verde.
 * Ao passar o mouse ou focar pelo teclado, o cartucho levanta e um reflexo cruza o rótulo.
 */
const shell = {
  dengo: "bg-clay-500 border-clay-700",
  lab: "bg-leaf-500 border-leaf-700",
} as const;

export function GameCard({ game, locale, dict }: { game: GameView; locale: Locale; dict: Dictionary }) {
  return (
    <article className="group relative flex w-full flex-col transition-transform duration-300 ease-out hover:-translate-y-2 focus-within:-translate-y-2 motion-reduce:transform-none">
      {/* Corpo do cartucho */}
      <div
        className={`relative flex flex-1 flex-col rounded-t-[1.75rem] rounded-b-xl border-b-8 px-3 pt-3 pb-4 shadow-md transition-shadow duration-300 group-hover:shadow-[0_18px_30px_-8px_rgb(59_36_24/0.45)] group-focus-within:shadow-[0_18px_30px_-8px_rgb(59_36_24/0.45)] group-has-[a:focus-visible]:ring-4 group-has-[a:focus-visible]:ring-orange-400 group-has-[a:focus-visible]:ring-offset-4 group-has-[a:focus-visible]:ring-offset-cream-100 sm:px-4 ${shell[game.category]}`}
      >
        {/* Ranhuras do topo */}
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-3 w-2/3 rounded-full bg-[repeating-linear-gradient(90deg,rgb(0_0_0/0.22)_0_3px,transparent_3px_9px)]"
        />

        {/* Rótulo */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-cream-50 p-1.5 shadow-[inset_0_0_0_2px_rgb(59_36_24/0.12)]">
          <div className="relative overflow-hidden rounded-md">
            <Cover game={game} dict={dict} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
            {/* Reflexo */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/45 to-transparent motion-safe:group-hover:animate-[shine_0.9s_ease-out] motion-safe:group-focus-within:animate-[shine_0.9s_ease-out]"
            />
            <span className="absolute top-2 left-2 rounded-full bg-cream-50/95 px-2.5 py-0.5 text-[0.7rem] font-bold tracking-wide text-clay-700 uppercase">
              {dict.games.status[game.status]}
            </span>
          </div>

          <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
            <h3 className="font-display text-xl leading-tight font-bold text-ink">
              {/* O link cobre o cartucho inteiro (clique em qualquer lugar). */}
              <Link
                href={localizedHref(locale, gamePath(game))}
                className="after:absolute after:inset-0 after:rounded-t-[1.75rem] focus-visible:outline-none"
              >
                {game.title}
              </Link>
            </h3>
            {game.category === "lab" && game.authors.length > 0 && (
              <p className="mt-0.5 text-sm font-semibold text-leaf-700">
                {dict.games.by} {game.authors.map((a) => a.name).join(", ")}
              </p>
            )}
            <p className="mt-1.5 flex-1 text-sm text-ink-soft">{game.summary[locale]}</p>
          </div>
        </div>
      </div>

      {/* Conectores */}
      <div
        aria-hidden="true"
        className="mx-auto h-3 w-3/4 rounded-b-md bg-ink/80 bg-[repeating-linear-gradient(90deg,#e0b04a_0_5px,transparent_5px_9px)] bg-[length:100%_70%] bg-no-repeat"
      />
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
