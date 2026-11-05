import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { lang } from "next/root-params";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionaries";
import { locales } from "@/lib/i18n";
import "../globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: { default: dict.meta.title, template: `%s · ${dict.meta.title}` },
    description: dict.meta.description,
    alternates: { languages: { "pt-BR": "/", en: "/en" } },
    openGraph: { images: ["/images/logo.jpg"] },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  const dict = await getDictionary();

  return (
    <html
      lang={locale === "pt" ? "pt-BR" : "en"}
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-lg bg-clay-600 px-4 py-2 font-bold text-cream-50 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          {dict.a11y.skipToContent}
        </a>
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
