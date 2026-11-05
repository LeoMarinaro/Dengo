import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";
import { site } from "@/data/site";

export async function Footer() {
  const dict = await getDictionary();
  const locale = await getLocale();
  const year = 2026;

  return (
    <footer id="contato" className="mt-24 bg-clay-700 text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-semibold text-cream-300">
            {dict.footer.contactTitle}
          </h2>
          <p className="mt-3 max-w-md text-cream-100/90">{dict.footer.contactText}</p>
          {site.email && (
            <a
              href={`mailto:${site.email}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream-300 px-5 py-3 font-display font-semibold text-clay-700 transition-colors hover:bg-cream-50"
            >
              <span className="sr-only">{dict.footer.emailLabel}: </span>
              {site.email}
            </a>
          )}
        </div>

        <div className="md:justify-self-end">
          <h2 className="font-display text-xl font-semibold text-cream-300">
            {dict.footer.findUs}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full border-2 border-cream-100/30 px-4 py-2 font-semibold transition-colors hover:border-cream-300 hover:text-cream-300"
                >
                  {s.label}
                  <span className="sr-only"> {dict.a11y.opensInNewTab}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-100/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-cream-100/75 sm:px-6">
          <p>
            © {year} {site.name}. {dict.footer.rights}
          </p>
          <Link href={localizedHref(locale, "/entrar")} className="underline-offset-4 hover:text-cream-300 hover:underline">
            {dict.footer.members}
          </Link>
        </div>
      </div>
    </footer>
  );
}
