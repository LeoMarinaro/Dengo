"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef, useState, useTransition } from "react";
import { addGameImage, addGameVideo, moveGameMedia, removeGameMedia, type ActionResult } from "@/lib/actions";
import { buttonClass, Card, Feedback, Field, inputClass, secondaryButtonClass } from "./ui";

type Media = { id: string; type: "image" | "youtube"; url: string };

export function GalleryManager({ gameId, media }: { gameId: string; media: Media[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<ActionResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoState, videoAction, videoPending] = useActionState(addGameVideo.bind(null, gameId), null);
  const [busy, startTransition] = useTransition();

  // Envia as imagens uma por vez (cada requisição tem limite de ~4 MB).
  async function uploadSelected() {
    const files = Array.from(fileInput.current?.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadState(null);
    const errors: string[] = [];
    for (const [i, file] of files.entries()) {
      setUploadState({ ok: true, message: `Enviando ${i + 1} de ${files.length}...` });
      const formData = new FormData();
      formData.set("image", file);
      const result = await addGameImage(gameId, formData);
      if (!result.ok) errors.push(result.error);
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
    setUploadState(errors.length ? { ok: false, error: errors.join(" ") } : { ok: true, message: "Imagens enviadas!" });
    router.refresh();
  }

  function run(fn: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setUploadState(result);
      router.refresh();
    });
  }

  return (
    <Card title="Galeria">
      <p className="-mt-3 mb-5 text-sm text-ink-soft">
        O primeiro item aparece em destaque, e a primeira imagem vira a capa do card.
      </p>

      {media.length === 0 ? (
        <p className="mb-6 rounded-xl bg-cream-100 p-4 text-ink-soft">Nenhuma foto ou vídeo ainda.</p>
      ) : (
        <ol className="mb-6 space-y-3" aria-busy={busy}>
          {media.map((m, i) => (
            <li key={m.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-cream-100 p-3">
              <span className="w-6 text-center font-display font-bold text-clay-600">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura simples no painel */}
              <img
                src={m.type === "image" ? m.url : `https://i.ytimg.com/vi/${m.url}/mqdefault.jpg`}
                alt=""
                className="h-16 w-28 rounded-lg object-cover"
              />
              <span className="flex-1 text-sm text-ink-soft">{m.type === "image" ? "Imagem" : "Vídeo do YouTube"}</span>
              <div className="flex gap-2">
                <button type="button" disabled={busy || i === 0} onClick={() => run(() => moveGameMedia(m.id, -1))} className={secondaryButtonClass}>
                  ↑<span className="sr-only"> Mover item {i + 1} para cima</span>
                </button>
                <button type="button" disabled={busy || i === media.length - 1} onClick={() => run(() => moveGameMedia(m.id, 1))} className={secondaryButtonClass}>
                  ↓<span className="sr-only"> Mover item {i + 1} para baixo</span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (confirm("Remover este item da galeria?")) run(() => removeGameMedia(m.id));
                  }}
                  className={secondaryButtonClass}
                >
                  Remover<span className="sr-only"> item {i + 1}</span>
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Field label="Adicionar fotos" hint="até 4 MB cada">
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-2 block text-sm file:mr-3 file:rounded-full file:border-0 file:bg-cream-200 file:px-4 file:py-2 file:font-semibold file:text-clay-700"
            />
          </Field>
          <button type="button" onClick={uploadSelected} disabled={uploading} className={`${buttonClass} mt-3`}>
            {uploading ? "Enviando..." : "Enviar fotos"}
          </button>
        </div>

        <form action={videoAction}>
          <Field label="Adicionar vídeo do YouTube">
            <input name="youtube" type="url" required placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
          </Field>
          <button type="submit" disabled={videoPending} className={`${buttonClass} mt-3`}>
            {videoPending ? "Adicionando..." : "Adicionar vídeo"}
          </button>
          <div className="mt-3">
            <Feedback state={videoState} />
          </div>
        </form>
      </div>

      <div className="mt-4">
        <Feedback state={uploadState} />
      </div>
    </Card>
  );
}
