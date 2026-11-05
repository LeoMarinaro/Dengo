"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteGame } from "@/lib/actions";

export function DeleteGameButton({ gameId, title, redirectTo }: { gameId: string; title: string; redirectTo: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div>
      <p className="mb-4 text-ink-soft">Apagar o jogo remove a página, a galeria e as imagens enviadas. Não dá pra desfazer.</p>
      <button
        type="button"
        disabled={pending}
        className="rounded-full bg-red-800 px-5 py-2.5 font-display font-semibold text-white transition-colors hover:bg-red-900 disabled:opacity-60"
        onClick={() => {
          if (!confirm(`Apagar "${title}" de vez?`)) return;
          startTransition(async () => {
            const result = await deleteGame(gameId);
            if (!result.ok) return setError(result.error);
            router.replace(redirectTo);
            router.refresh();
          });
        }}
      >
        {pending ? "Apagando..." : "Apagar jogo"}
      </button>
      {error && (
        <p role="alert" className="mt-3 font-semibold text-red-900">
          {error}
        </p>
      )}
    </div>
  );
}
