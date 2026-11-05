import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";
import { Suspense } from "react";
import { NavLinks, NavList, type NavItem } from "./NavLinks";
import { LanguageSwitcher, LanguageToggle } from "./LanguageSwitcher";

export async function Header() {
  const locale = await getLocale();
  const dict = await getDictionary();

  const items: NavItem[] = [
    { href: localizedHref(locale, "/"), label: dict.nav.home },
    {
      href: localizedHref(locale, "/jogos"),
      label: dict.nav.games,
      children: [
        { href: localizedHref(locale, "/jogos/dengo"), label: dict.nav.dengo },
        { href: localizedHref(locale, "/jogos/lab"), label: dict.nav.lab },
      ],
    },
    { href: localizedHref(locale, "/equipe"), label: dict.nav.team },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-clay-500/15 bg-cream-100/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href={localizedHref(locale, "/")}
          aria-label={dict.a11y.home}
          className="flex items-center gap-3"
        >
          <Image
            src="/images/logo.jpg"
            alt=""
            width={44}
            height={44}
            className="rounded-xl shadow-sm"
            priority
          />
          <span className="font-display text-xl font-semibold tracking-tight text-clay-700">
            Dengo Studios
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:order-last">
          <Suspense fallback={<LanguageToggle locale={locale} label={dict.a11y.switchLanguage} />}>
            <LanguageSwitcher locale={locale} label={dict.a11y.switchLanguage} />
          </Suspense>
        </div>

        <nav aria-label={dict.a11y.mainNav} className="w-full sm:w-auto sm:ml-auto">
          <Suspense fallback={<NavList items={items} current={null} />}>
            <NavLinks items={items} />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
