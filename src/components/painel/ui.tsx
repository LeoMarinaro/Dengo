/* Peças de formulário reaproveitadas no login e no painel. */

import type { ActionResult } from "@/lib/actions";

export const inputClass =
  "mt-1 block w-full rounded-xl border-2 border-clay-500/25 bg-cream-50 px-3 py-2 text-ink placeholder:text-ink-soft/50 focus:border-clay-500 focus:outline-none";

export const buttonClass =
  "inline-flex items-center justify-center rounded-full bg-clay-600 px-5 py-2.5 font-display font-semibold text-cream-50 transition-colors hover:bg-clay-700 disabled:cursor-wait disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border-2 border-clay-500/40 px-4 py-2 font-display font-semibold text-clay-700 transition-colors hover:border-clay-500 hover:bg-cream-200 disabled:opacity-50";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-display font-semibold text-ink">{label}</span>
      {hint && <span className="ml-2 text-sm text-ink-soft">{hint}</span>}
      {children}
    </label>
  );
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border-2 border-clay-500/15 bg-cream-50 p-5 shadow-sm sm:p-8">
      {title && <h2 className="mb-5 font-display text-2xl font-bold text-clay-700">{title}</h2>}
      {children}
    </section>
  );
}

export function Feedback({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  if (!state.ok)
    return (
      <p role="alert" className="rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-900">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p role="status" className="rounded-xl bg-leaf-500/15 px-4 py-2 font-semibold text-leaf-700">
        {state.message}
      </p>
    );
  return null;
}
