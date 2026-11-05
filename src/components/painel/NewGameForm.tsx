"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { createGame } from "@/lib/actions";
import { buttonClass, Feedback, Field, inputClass } from "./ui";

export function NewGameForm({ editPath }: { editPath: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createGame, null);

  // Criou? Abre a tela de edição completa.
  useEffect(() => {
    if (state?.ok && state.id) router.push(`${editPath}/${state.id}`);
  }, [state, editPath, router]);

  return (
    <form action={action} className="space-y-5">
      <Field label="Nome do jogo">
        <input name="title" required maxLength={100} className={inputClass} />
      </Field>
      <fieldset>
        <legend className="font-display font-semibold text-ink">Tipo</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="category" value="dengo" required className="accent-clay-600" />
            Jogo da Dengo <span className="text-sm text-ink-soft">(equipe toda)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="category" value="lab" className="accent-clay-600" />
            Dengo Lab <span className="text-sm text-ink-soft">(projeto pessoal)</span>
          </label>
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Criando..." : "Criar e editar"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
