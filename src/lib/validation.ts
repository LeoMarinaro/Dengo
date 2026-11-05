/** "Meu Jogo Incrível!" -> "meu-jogo-incrivel" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Aceita links do YouTube (watch, youtu.be, shorts, embed) e devolve só o ID do vídeo. */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Só aceita links http(s). Retorna a URL normalizada ou null. */
export function cleanUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function checkImage(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Formato não aceito. Use JPG, PNG, WebP ou GIF.";
  if (file.size > MAX_IMAGE_BYTES) return "A imagem passa de 4 MB. Diminua o tamanho e tente de novo.";
  return null;
}

export const text = (formData: FormData, key: string, max = 5000) =>
  String(formData.get(key) ?? "").trim().slice(0, max);
