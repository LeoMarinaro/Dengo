import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { localizedHref, type Locale } from "@/lib/i18n";
import { getMembers, type MemberView } from "@/lib/queries";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.team.title };
}

/**
 * Homenagem às telas de seleção de fase dos jogos de ação 8-bit:
 * grade 3x3, logo no centro, mascote nas laterais do meio,
 * membros nas linhas de cima e de baixo.
 */
export default async function TeamPage() {
  const locale = await getLocale();
  const dict = await getDictionary();

  // 6 vagas: 3 em cima, 3 embaixo. Vaga sem membro aparece como "em aberto".
  const members = await getMembers();
  const slots = Array.from({ length: 6 }, (_, i) => members[i] ?? null);
  const top = slots.slice(0, 3);
  const bottom = slots.slice(3, 6);

  return (
    <section aria-labelledby="equipe" className="bg-[#24140c] px-4 py-14 sm:py-20">
      <div className={`${pixel.className} mx-auto max-w-3xl`}>
        <h1 id="equipe" className="sr-only">
          {dict.team.title}
        </h1>
        <p aria-hidden="true" className="mb-8 text-center text-sm text-cream-300 sm:text-lg">
          <span className="motion-safe:animate-pulse">{dict.team.select.toUpperCase()}</span>
        </p>

        <ul className="grid grid-cols-3 gap-3 sm:gap-6">
          {top.map((m, i) =>
            m ? <MemberTile key={m.id} member={m} locale={locale} /> : <EmptyTile key={`top-${i}`} label={dict.team.emptySlot} />,
          )}

          <MascotTile label={dict.team.mascot} />
          <li aria-hidden="true" className="flex flex-col">
            <Frame>
              <Image src="/images/logo.jpg" alt="" fill sizes="(min-width: 640px) 220px, 30vw" className="object-cover" />
            </Frame>
            <Label>DENGO</Label>
          </li>
          <MascotTile label={dict.team.mascot} />

          {bottom.map((m, i) =>
            m ? <MemberTile key={m.id} member={m} locale={locale} /> : <EmptyTile key={`bottom-${i}`} label={dict.team.emptySlot} />,
          )}
        </ul>
      </div>
    </section>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-square overflow-hidden border-4 border-cream-300 bg-clay-700 shadow-[inset_0_0_0_4px_#24140c]">
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-2 block truncate text-center text-[0.55rem] leading-relaxed text-cream-100 sm:text-xs">
      {children}
    </span>
  );
}

function MemberTile({ member, locale }: { member: MemberView; locale: Locale }) {
  return (
    <li className="flex flex-col">
      <Link
        href={localizedHref(locale, `/equipe/${member.slug}`)}
        className="group relative block focus-visible:outline-none"
      >
        <Frame>
          {member.photoUrl ? (
            <Image src={member.photoUrl} alt="" fill sizes="(min-width: 640px) 220px, 30vw" className="object-cover [image-rendering:pixelated]" />
          ) : (
            <span aria-hidden="true" className="flex h-full items-center justify-center text-2xl text-cream-300/70 sm:text-4xl">
              {member.name.charAt(0)}
            </span>
          )}
        </Frame>
        <Cursor />
        <Label>{member.name.toUpperCase()}</Label>
      </Link>
    </li>
  );
}

function EmptyTile({ label }: { label: string }) {
  return (
    <li className="flex flex-col">
      <Frame>
        <span aria-hidden="true" className="flex h-full items-center justify-center text-cream-300/25">
          -
        </span>
      </Frame>
      <Label>
        <span className="sr-only">{label}</span>
        <span aria-hidden="true">---</span>
      </Label>
    </li>
  );
}

function MascotTile({ label }: { label: string }) {
  return (
    <li className="flex flex-col">
      <Frame>
        <span aria-hidden="true" className="flex h-full items-center justify-center text-2xl text-cream-300/40 sm:text-4xl">
          ?
        </span>
      </Frame>
      <Label>
        <span className="sr-only">{label}</span>
        <span aria-hidden="true">???</span>
      </Label>
    </li>
  );
}

/** Cantoneiras piscando em volta do retrato selecionado (hover ou foco). */
function Cursor() {
  const corner = "absolute h-4 w-4 border-orange-400 sm:h-6 sm:w-6";
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -inset-2 hidden group-hover:block group-focus-visible:block motion-safe:animate-[blink_0.6s_steps(1)_infinite] sm:-inset-3"
    >
      <span className={`${corner} top-0 left-0 border-t-4 border-l-4`} />
      <span className={`${corner} top-0 right-0 border-t-4 border-r-4`} />
      <span className={`${corner} bottom-6 left-0 border-b-4 border-l-4 sm:bottom-8`} />
      <span className={`${corner} right-0 bottom-6 border-r-4 border-b-4 sm:bottom-8`} />
    </span>
  );
}
