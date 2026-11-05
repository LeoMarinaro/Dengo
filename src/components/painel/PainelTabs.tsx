"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; exact?: boolean };

export function PainelTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Seções do painel" className="mt-6 border-b-2 border-clay-500/15">
      <ul className="-mb-0.5 flex gap-2">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`block border-b-4 px-4 py-2 font-display font-semibold transition-colors ${
                  active ? "border-clay-500 text-clay-700" : "border-transparent text-ink-soft hover:text-clay-700"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
