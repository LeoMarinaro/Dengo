import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";
import { getGame, type GameView } from "@/lib/queries";
import type { Dictionary } from "@/lib/dictionaries";

type Props = PageProps<"/[lang]/jogos/[category]/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const game = await getGame(category, slug);
  if (!game) return {};
  const locale = await getLocale();
  return {
    title: game.title,
    description: game.summary[locale],
    openGraph: game.cover ? { images: [game.cover] } : undefined,
  };
}

// Jogos são criados pelo painel, então a página é gerada na primeira visita
// (o `await params` fica dentro do Suspense) e depois fica em cache.
export default function GamePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-4xl px-4 pt-10 sm:px-6" />}>
      <GameDetails params={params} />
    </Suspense>
  );
}

async function GameDetails({ params }: Pick<Props, "params">) {
  const { category, slug } = await params;
  const game = await getGame(category, slug);
  if (!game) notFound();

  const locale = await getLocale();
  const dict = await getDictionary();
  const categoryTitle = game.category === "dengo" ? dict.games.dengoTitle : dict.games.labTitle;
  const paragraphs = game.description[locale].split(/\n\s*\n/).filter(Boolean);

  return (
    <article className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
      <Link
        href={localizedHref(locale, `/jogos/${game.category}`)}
        className="font-display font-semibold text-clay-600 hover:text-clay-700"
      >
        ← {dict.games.backTo} {categoryTitle}
      </Link>

      <header className="mt-6">
        <p className="text-sm font-bold tracking-wide text-clay-600 uppercase">{dict.games.status[game.status]}</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-clay-700 sm:text-5xl">{game.title}</h1>
        <p className="mt-2 font-semibold text-leaf-700">
          {dict.games.by}{" "}
          {game.category === "dengo"
            ? "Dengo Studios"
            : game.authors.map((a, i) => (
                <span key={a.slug}>
                  {i > 0 && ", "}
                  <Link href={localizedHref(locale, `/equipe/${a.slug}`)} className="underline underline-offset-4 hover:text-clay-700">
                    {a.name}
                  </Link>
                </span>
              ))}
        </p>
      </header>

      <Gallery game={game} dict={dict} />

      {paragraphs.length > 0 && (
        <div className="mt-8 space-y-4 text-lg leading-relaxed whitespace-pre-line text-ink-soft">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {game.itchUrl && (
        <a
          href={game.itchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center rounded-full bg-clay-600 px-6 py-3 font-display text-lg font-semibold text-cream-50 transition-colors hover:bg-clay-700"
        >
          {dict.games.playOnItch}
          <span className="sr-only"> {dict.a11y.opensInNewTab}</span>
        </a>
      )}
    </article>
  );
}

function Gallery({ game, dict }: { game: GameView; dict: Dictionary }) {
  if (game.media.length === 0) {
    return (
      <div className="mt-8 flex aspect-video items-center justify-center rounded-3xl border-2 border-clay-500/15 bg-tiles font-semibold text-clay-500/70">
        {dict.games.noScreenshot}
      </div>
    );
  }

  const [first, ...rest] = game.media;
  let imageCount = 0;
  const alt = () => `${dict.games.screenshotAlt} ${game.title} (${++imageCount})`;

  return (
    <section aria-label={dict.games.gallery} className="mt-8 space-y-4">
      <MediaItem media={first} alt={alt()} title={game.title} large />
      {rest.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rest.map((m) => (
            <li key={m.id} className={m.type === "youtube" ? "sm:col-span-2" : undefined}>
              <MediaItem media={m} alt={m.type === "image" ? alt() : ""} title={game.title} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MediaItem({ media, alt, title, large }: { media: GameView["media"][number]; alt: string; title: string; large?: boolean }) {
  const frame = "relative aspect-video overflow-hidden rounded-3xl border-2 border-clay-500/15 bg-ink shadow-md";
  if (media.type === "youtube") {
    return (
      <div className={frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${media.url}`}
          title={`${title}: vídeo`}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }
  return (
    <div className={frame}>
      <Image
        src={media.url}
        alt={alt}
        fill
        priority={large}
        sizes={large ? "(min-width: 896px) 896px, 100vw" : "(min-width: 640px) 448px, 100vw"}
        className="object-cover"
      />
    </div>
  );
}
