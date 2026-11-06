export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="bg-accent text-accent-ink">
      <div className="container-x flex h-[var(--announcement-height)] items-center justify-center gap-2.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-ink" aria-hidden="true" />
        <p className="font-mono text-[10px] font-medium uppercase leading-none tracking-[0.18em] sm:text-[11px]">
          {text}
        </p>
      </div>
    </div>
  );
}
