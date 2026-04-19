export const SocialProofSection = () => {
  return (
    <section className="border-b border-[var(--home-border)] py-6">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center gap-6 px-4 md:justify-start">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--home-muted)]">
          Built with coaches in Sweden and Norway
        </span>
        <span className="hidden h-3 w-px bg-[var(--home-border)] md:block" />
        <span className="inline-flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--home-text)]">
          <span className="h-1.5 w-1.5 rounded-none bg-[var(--home-accent)]" />
          Strength &amp; powerlifting focused
        </span>
        <span className="inline-flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--home-text)]">
          <span className="h-1.5 w-1.5 rounded-none bg-[var(--home-accent)]" />
          14-day free trial
        </span>
      </div>
    </section>
  );
};
