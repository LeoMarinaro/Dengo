import Image from "next/image";
import Link from "next/link";
import { GameGrid } from "@/components/GameCard";
import type { GameCategory } from "@/db/schema";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";
import { getGames } from "@/lib/queries";

export default async function HomePage() {
  const locale = await getLocale();
  const dict = await getDictionary();

  const [dengoGames, labGames] = await Promise.all([getGames("dengo"), getGames("lab")]);
  const sections: { category: GameCategory; title: string; text: string; games: typeof dengoGames }[] = [
    { category: "dengo", title: dict.home.dengoTitle, text: dict.home.dengoText, games: dengoGames },
    { category: "lab", title: dict.home.labTitle, text: dict.home.labText, games: labGames },
  ];

  return (
    <>
      {/* Sobre nós */}
      <section aria-labelledby="sobre" className="bg-tiles">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[2fr_3fr] md:py-24">
          <Image
            src="/images/logo.jpg"
            alt={dict.home.aboutImageAlt}
            width={640}
            height={640}
            priority
            sizes="(min-width: 768px) 40vw, 90vw"
            className="mx-auto w-full max-w-sm rounded-[2rem] shadow-xl"
          />
          <div>
            <h1 id="sobre" className="font-display text-4xl font-bold text-clay-700 sm:text-5xl">
              {dict.home.aboutTitle}
            </h1>
            {dict.home.about.map((p) => (
              <p key={p.slice(0, 24)} className="mt-5 text-lg leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Jogos da Dengo e Dengo Lab */}
      {sections.map((s) => (
        <section key={s.category} aria-labelledby={`home-${s.category}`} className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id={`home-${s.category}`} className="font-display text-3xl font-bold text-clay-700">
                {s.title}
              </h2>
              <p className="mt-1 text-ink-soft">{s.text}</p>
            </div>
            <Link
              href={localizedHref(locale, `/jogos/${s.category}`)}
              className="rounded-full border-2 border-clay-500/40 px-4 py-2 font-display font-semibold text-clay-700 transition-colors hover:border-clay-500 hover:bg-cream-200"
            >
              {dict.home.seeAll} <span className="sr-only">: {s.title}</span> →
            </Link>
          </div>
          <GameGrid games={s.games.slice(0, 3)} locale={locale} dict={dict} />
        </section>
      ))}
    </>
  );
}
