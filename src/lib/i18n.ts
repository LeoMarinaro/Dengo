export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Texto que existe nos dois idiomas (usado nos arquivos de dados). */
export type Localized = Record<Locale, string>;

/**
 * Monta o link para uma rota interna no idioma certo.
 * Português (padrão) fica sem prefixo: "/jogos". Inglês ganha "/en": "/en/jogos".
 */
export function localizedHref(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Remove o prefixo de idioma de um pathname visível ("/en/jogos" -> "/jogos"). */
export function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}
