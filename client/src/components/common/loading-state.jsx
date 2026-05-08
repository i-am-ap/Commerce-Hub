export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-3xl border border-dashed border-border bg-white/70">
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

