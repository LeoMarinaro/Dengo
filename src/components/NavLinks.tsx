"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { stripLocale } from "@/lib/i18n";

type LinkItem = { label: string; href: string };
export type NavItem = LinkItem & { children?: LinkItem[] };

const isActive = (current: string | null, href: string) => {
  if (current === null) return false;
  const target = stripLocale(href);
  return target === "/" ? current === "/" : current === target || current.startsWith(`${target}/`);
};

const itemClass = (active: boolean) =>
  `flex items-center gap-1 rounded-full px-4 py-2 font-display text-base font-medium transition-colors ${
    active ? "bg-clay-500 text-cream-50" : "text-ink hover:bg-cream-200 hover:text-clay-700"
  }`;

/** Lê a URL atual para destacar o item ativo. Deve ficar dentro de <Suspense>. */
export function NavLinks({ items }: { items: NavItem[] }) {
  return <NavList items={items} current={stripLocale(usePathname())} />;
}

/** Só o visual do menu (sem ler a URL); usado também como fallback do Suspense. */
export function NavList({ items, current }: { items: NavItem[]; current: string | null }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {items.map((item) =>
        item.children ? (
          <li key={item.label} className="relative">
            <Dropdown item={item} current={current} />
          </li>
        ) : (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(current, item.href) ? "page" : undefined}
              className={itemClass(isActive(current, item.href))}
            >
              {item.label}
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

function Dropdown({ item, current }: { item: NavItem; current: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const children = item.children ?? [];
  const active = children.some((c) => isActive(current, c.href));

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={itemClass(active)}
      >
        {item.label}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="currentColor"
        >
          <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul
        id={menuId}
        hidden={!open}
        className="absolute left-0 z-50 mt-2 min-w-52 rounded-2xl border-2 border-clay-500/15 bg-cream-50 p-2 shadow-lg"
      >
        {children.map((child) => {
          const childActive = isActive(current, child.href);
          return (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={() => setOpen(false)}
                aria-current={childActive ? "page" : undefined}
                className={`block rounded-xl px-4 py-2.5 font-display font-medium transition-colors ${
                  childActive ? "bg-cream-200 text-clay-700" : "text-ink hover:bg-cream-200 hover:text-clay-700"
                }`}
              >
                {child.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
