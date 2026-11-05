"use client";

import { useActionState } from "react";
import type { GameStatus } from "@/db/schema";
import { updateGame } from "@/lib/actions";
import { submitWithoutReset } from "./submit";
import { buttonClass, Card, Feedback, Field, inputClass } from "./ui";

type Initial = {
  title: string;
  status: GameStatus;
  itchUrl: string;
  summaryPt: string;
  summaryEn: string;
  descriptionPt: string;
  descriptionEn: string;
};

type Authors = {
  all: { id: string; name: string }[];
  selected: string[];
  currentMemberId: string;
} | null;

export function GameForm({ gameId, initial, authors }: { gameId: string; initial: Initial; authors: Authors }) {
  const [state, action, pending] = useActionState(updateGame.bind(null, gameId), null);

  return (
    <form onSubmit={submitWithoutReset(action)} className="space-y-6">
      <Card title="Informações">
        <div className="space-y-5">
          <Field label="Nome do jogo">
            <input name="title" defaultValue={initial.title} required maxLength={100} className={inputClass} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Status">
              <select name="status" defaultValue={initial.status} className={inputClass}>
                <option value="prototype">Protótipo</option>
                <option value="in-development">Em desenvolvimento</option>
                <option value="released">Lançado</option>
              </select>
            </Field>
            <Field label="Link do itch.io">
              <input name="itchUrl" type="url" defaultValue={initial.itchUrl} placeholder="https://dengo.itch.io/..." className={inputClass} />
            </Field>
          </div>
          <Field label="Resumo" hint="(português, aparece no card)">
            <input name="summaryPt" defaultValue={initial.summaryPt} maxLength={200} className={inputClass} />
          </Field>
          <Field label="Resumo" hint="(inglês)">
            <input name="summaryEn" defaultValue={initial.summaryEn} maxLength={200} className={inputClass} />
          </Field>
          <Field label="Descrição" hint="(português; deixe uma linha em branco entre parágrafos)">
            <textarea name="descriptionPt" defaultValue={initial.descriptionPt} rows={8} className={inputClass} />
          </Field>
          <Field label="Descrição" hint="(inglês; se ficar vazia, mostra a versão em português)">
            <textarea name="descriptionEn" defaultValue={initial.descriptionEn} rows={8} className={inputClass} />
          </Field>
        </div>
      </Card>

      {authors && (
        <Card title="Autores">
          <fieldset>
            <legend className="mb-3 text-sm text-ink-soft">
              Quem fez este projeto. Todos os marcados podem editá-lo. Se você se desmarcar, perde o acesso.
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {authors.all.map((m) => (
                <label key={m.id} className="flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2">
                  <input
                    type="checkbox"
                    name="authors"
                    value={m.id}
                    defaultChecked={authors.selected.includes(m.id)}
                    className="h-4 w-4 accent-clay-600"
                  />
                  {m.name}
                  {m.id === authors.currentMemberId && <span className="text-sm text-ink-soft">(você)</span>}
                </label>
              ))}
            </div>
          </fieldset>
        </Card>
      )}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl bg-cream-100/95 p-3 backdrop-blur">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Salvando..." : "Salvar jogo"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
