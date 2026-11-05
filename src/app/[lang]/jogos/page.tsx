import { redirect } from "next/navigation";
import { getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";

// "/jogos" sozinho não tem página própria: manda para os jogos da Dengo.
export default async function GamesIndex() {
  redirect(localizedHref(await getLocale(), "/jogos/dengo"));
}
