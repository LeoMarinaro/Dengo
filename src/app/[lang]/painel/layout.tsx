import type { Metadata } from "next";
import { Suspense } from "react";
import { PainelTabs } from "@/components/painel/PainelTabs";
import { SignOutButton } from "@/components/painel/SignOutButton";
import { getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default async function PainelLayout({ children }: LayoutProps<"/[lang]/painel">) {
  const locale = await getLocale();
  const tabs = [
    { href: localizedHref(locale, "/painel"), label: "Meu perfil", exact: true },
    { href: localizedHref(locale, "/painel/jogos"), label: "Jogos" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-clay-700">Painel</h1>
        <SignOutButton redirectTo={localizedHref(locale, "/entrar")} />
      </div>
      <Suspense fallback={<div className="mt-6 h-12 border-b-2 border-clay-500/15" />}>
        <PainelTabs tabs={tabs} />
      </Suspense>
      <div className="mt-8">{children}</div>
    </div>
  );
}
