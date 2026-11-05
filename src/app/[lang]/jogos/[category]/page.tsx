import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameGrid } from "@/components/GameCard";
import { PageHeader } from "@/components/PageHeader";
import type { GameCategory } from "@/db/schema";
import { getDictionary, getLocale, type Dictionary } from "@/lib/dictionaries";
import { gameCategories, getGames, isGameCategory } from "@/lib/queries";

export async function generateStaticParams() {
  return gameCategories.map((category) => ({ category }));
}

const texts = (dict: Dictionary, category: GameCategory) =>
  category === "dengo"
    ? { title: dict.games.dengoTitle, intro: dict.games.dengoIntro }
    : { title: dict.games.labTitle, intro: dict.games.labIntro };

export async function generateMetadata({ params }: PageProps<"/[lang]/jogos/[category]">): Promise<Metadata> {
  const { category } = await params;
  if (!isGameCategory(category)) return {};
  const { title, intro } = texts(await getDictionary(), category);
  return { title, description: intro };
}

export default async function GameCategoryPage({ params }: PageProps<"/[lang]/jogos/[category]">) {
  const { category } = await params;
  if (!isGameCategory(category)) notFound();

  const locale = await getLocale();
  const dict = await getDictionary();
  const { title, intro } = texts(dict, category);
  const games = await getGames(category);

  return (
    <>
      <PageHeader title={title} intro={intro} />
      <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <GameGrid games={games} locale={locale} dict={dict} />
      </div>
    </>
  );
}
