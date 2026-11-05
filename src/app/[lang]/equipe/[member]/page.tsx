import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GameGrid } from "@/components/GameCard";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";
import { getMemberWithGames } from "@/lib/queries";

// Layout provisório: o visual da página do membro ainda vai ser decidido com a equipe.

type Props = PageProps<"/[lang]/equipe/[member]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getMemberWithGames((await params).member);
  return data ? { title: data.member.name } : {};
}

export default function MemberPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-6xl px-4 pt-10 sm:px-6" />}>
      <MemberDetails params={params} />
    </Suspense>
  );
}

async function MemberDetails({ params }: Pick<Props, "params">) {
  const data = await getMemberWithGames((await params).member);
  if (!data) notFound();
  const { member, games } = data;

  const locale = await getLocale();
  const dict = await getDictionary();
  const bio = member.bio[locale].split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <Link href={localizedHref(locale, "/equipe")} className="font-display font-semibold text-clay-600 hover:text-clay-700">
        ← {dict.team.backToTeam}
      </Link>

      <div className="mt-8 grid items-start gap-8 md:grid-cols-[16rem_1fr]">
        <div className="relative aspect-square w-48 overflow-hidden rounded-3xl border-4 border-clay-500/20 bg-tiles md:w-full">
          {member.photoUrl ? (
            <Image src={member.photoUrl} alt={member.name} fill sizes="256px" className="object-cover" priority />
          ) : (
            <span aria-hidden="true" className="flex h-full items-center justify-center font-display text-7xl font-bold text-clay-500/50">
              {member.name.charAt(0)}
            </span>
          )}
        </div>

        <div>
          <h1 className="font-display text-4xl font-bold text-clay-700 sm:text-5xl">{member.name}</h1>
          {member.role[locale] && <p className="mt-1 text-lg font-semibold text-leaf-700">{member.role[locale]}</p>}

          {bio.length > 0 ? (
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
              {bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-ink-soft">{dict.team.memberPlaceholder}</p>
          )}

          {member.links.length > 0 && (
            <>
              <h2 className="sr-only">{dict.team.links}</h2>
              <ul className="mt-6 flex flex-wrap gap-3">
                {member.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full border-2 border-clay-500/40 px-4 py-2 font-semibold text-clay-700 transition-colors hover:border-clay-500 hover:bg-cream-200"
                    >
                      {link.label}
                      <span className="sr-only"> {dict.a11y.opensInNewTab}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {games.length > 0 && (
        <section aria-labelledby="lab" className="mt-14">
          <h2 id="lab" className="mb-6 font-display text-2xl font-bold text-clay-700">
            {dict.team.labGames}
          </h2>
          <GameGrid games={games} locale={locale} dict={dict} />
        </section>
      )}
    </div>
  );
}
