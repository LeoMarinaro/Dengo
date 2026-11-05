export function PageHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="bg-tiles">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="font-display text-4xl font-bold text-clay-700 sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">{intro}</p>
      </div>
    </div>
  );
}
