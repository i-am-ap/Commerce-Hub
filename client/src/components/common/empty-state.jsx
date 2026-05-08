export function EmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-white/75 p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

