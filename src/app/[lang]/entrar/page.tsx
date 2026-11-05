import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/painel/LoginForm";
import { getLocale } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/i18n";
import { getSession } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Área de membros",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-14 sm:pt-20">
      <h1 className="font-display text-4xl font-bold text-clay-700">Área de membros</h1>
      <p className="mt-2 text-ink-soft">Entre com o e-mail e a senha que a equipe te passou.</p>
      <div className="mt-8 rounded-3xl border-2 border-clay-500/15 bg-cream-50 p-6 shadow-sm sm:p-8">
        <Suspense>
          <LoginGate />
        </Suspense>
      </div>
    </div>
  );
}

async function LoginGate() {
  const locale = await getLocale();
  const painel = localizedHref(locale, "/painel");
  // Já está logado? Vai direto pro painel.
  if (await getSession()) redirect(painel);
  return <LoginForm redirectTo={painel} />;
}
