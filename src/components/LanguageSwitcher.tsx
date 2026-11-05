"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedHref, stripLocale, type Locale } from "@/lib/i18n";

type Props = { locale: Locale; label: string };

/** Troca de idioma mantendo a página atual. Deve ficar dentro de <Suspense>. */
export function LanguageSwitcher(props: Props) {
  return <LanguageToggle {...props} path={stripLocale(usePathname())} />;
}

/** Mostra "PT | EN": o idioma atual em destaque, o outro como link. Sem `path`, leva à home. */
export function LanguageToggle({ locale, label, path = "/" }: Props & { path?: string }) {
  const target: Locale = locale === "pt" ? "en" : "pt";

  const current = (
    <span aria-current="true" className="rounded-full bg-clay-500 px-2.5 py-1 text-cream-50">
      {locale.toUpperCase()}
    </span>
  );
  const other = (
    <Link
      href={localizedHref(target, path)}
      hrefLang={target === "pt" ? "pt-BR" : "en"}
      aria-label={label}
      className="rounded-full px-2.5 py-1 text-clay-700 transition-colors hover:bg-cream-200"
    >
      {target.toUpperCase()}
    </Link>
  );

  return (
    <div className="flex items-center gap-1 rounded-full border-2 border-clay-500/30 p-0.5 font-display text-sm font-semibold">
      {locale === "pt" ? current : other}
      <span aria-hidden="true" className="text-clay-500/50">|</span>
      {locale === "en" ? current : other}
    </div>
  );
}
