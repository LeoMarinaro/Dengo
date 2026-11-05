"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { buttonClass, Field, inputClass } from "./ui";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const { error } = await authClient.signIn.email({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    setPending(false);

    if (error) {
      setError(error.status === 429 ? "Muitas tentativas. Espere um pouco e tente de novo." : "E-mail ou senha incorretos.");
      return;
    }
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <Field label="E-mail">
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Senha">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      {error && (
        <p role="alert" className="rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-900">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
