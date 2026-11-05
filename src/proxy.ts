import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n";

/**
 * Português é o idioma padrão e fica sem prefixo na URL ("/jogos").
 * Internamente reescrevemos para "/pt/jogos" para cair na rota app/[lang].
 * Quem acessar "/pt/..." diretamente é redirecionado para a URL sem prefixo.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const defaultPrefix = `/${defaultLocale}`;
  if (pathname === defaultPrefix || pathname.startsWith(`${defaultPrefix}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultPrefix.length) || "/";
    return NextResponse.redirect(url);
  }

  const hasOtherLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasOtherLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `${defaultPrefix}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Ignora arquivos internos do Next, a pasta public e qualquer arquivo com extensão.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
