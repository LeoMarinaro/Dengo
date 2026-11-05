import Link from "next/link";
import { Suspense } from "react";
import { ProfileForm } from "@/components/painel/ProfileForm";
import { getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";
import { requireMember } from "@/lib/permissions";

export default function MeuPerfilPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Carregando...</p>}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const locale = await getLocale();
  const member = await requireMember(localizedHref(locale, "/entrar"));

  return (
    <>
      <p className="mb-6 text-ink-soft">
        Olá, <strong className="text-ink">{member.name}</strong>! Seu perfil público fica em{" "}
        <Link href={localizedHref(locale, `/equipe/${member.slug}`)} className="font-semibold text-clay-600 underline underline-offset-4">
          /equipe/{member.slug}
        </Link>
        .
      </p>
      <ProfileForm
        member={{
          name: member.name,
          rolePt: member.rolePt,
          roleEn: member.roleEn,
          bioPt: member.bioPt,
          bioEn: member.bioEn,
          photoUrl: member.photoUrl,
          links: member.links,
        }}
      />
    </>
  );
}
