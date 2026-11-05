"use client";

import { useActionState, useState } from "react";
import type { MemberLink } from "@/db/schema";
import { updateProfile } from "@/lib/actions";
import { buttonClass, Card, Feedback, Field, inputClass, secondaryButtonClass } from "./ui";

type ProfileData = {
  name: string;
  rolePt: string;
  roleEn: string;
  bioPt: string;
  bioEn: string;
  photoUrl: string | null;
  links: MemberLink[];
};

export function ProfileForm({ member }: { member: ProfileData }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  const [links, setLinks] = useState<(MemberLink & { key: number })[]>(
    member.links.map((l, i) => ({ ...l, key: i })),
  );
  const [preview, setPreview] = useState<string | null>(member.photoUrl);

  return (
    <form action={action} className="space-y-6">
      <Card title="Sobre você">
        <div className="space-y-5">
          <Field label="Nome">
            <input name="name" defaultValue={member.name} required maxLength={80} className={inputClass} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Função" hint="(português)">
              <input name="rolePt" defaultValue={member.rolePt} maxLength={80} placeholder="Ex.: Programação" className={inputClass} />
            </Field>
            <Field label="Função" hint="(inglês)">
              <input name="roleEn" defaultValue={member.roleEn} maxLength={80} placeholder="Ex.: Programming" className={inputClass} />
            </Field>
          </div>
          <Field label="Bio" hint="(português)">
            <textarea name="bioPt" defaultValue={member.bioPt} rows={5} maxLength={2000} className={inputClass} />
          </Field>
          <Field label="Bio" hint="(inglês; se ficar vazio, mostra a versão em português)">
            <textarea name="bioEn" defaultValue={member.bioEn} rows={5} maxLength={2000} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card title="Foto">
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-clay-500/20 bg-tiles">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element -- pré-visualização local do arquivo escolhido
              <img src={preview} alt="Sua foto" className="h-full w-full object-cover" />
            )}
          </div>
          <Field label="Trocar foto" hint="JPG, PNG, WebP ou GIF, até 4 MB">
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-2 block text-sm file:mr-3 file:rounded-full file:border-0 file:bg-cream-200 file:px-4 file:py-2 file:font-semibold file:text-clay-700"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
          </Field>
        </div>
      </Card>

      <Card title="Links">
        <p className="-mt-3 mb-4 text-sm text-ink-soft">itch.io, portfólio, redes sociais...</p>
        <ul className="space-y-3">
          {links.map((link, i) => (
            <li key={link.key} className="flex flex-wrap items-end gap-3">
              <Field label={`Nome do link ${i + 1}`}>
                <input name="linkLabel" defaultValue={link.label} maxLength={40} placeholder="itch.io" className={`${inputClass} w-40`} />
              </Field>
              <div className="min-w-48 flex-1">
                <Field label="Endereço">
                  <input name="linkUrl" type="url" defaultValue={link.url} placeholder="https://" className={inputClass} />
                </Field>
              </div>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => setLinks((ls) => ls.filter((l) => l.key !== link.key))}
              >
                Remover <span className="sr-only">link {i + 1}</span>
              </button>
            </li>
          ))}
        </ul>
        {links.length < 10 && (
          <button
            type="button"
            className={`${secondaryButtonClass} mt-4`}
            onClick={() => setLinks((ls) => [...ls, { label: "", url: "", key: Date.now() }])}
          >
            + Adicionar link
          </button>
        )}
      </Card>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl bg-cream-100/95 p-3 backdrop-blur">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Salvando..." : "Salvar perfil"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
