export const SocialProofSection = () => {
  return (
    <section className="border-b border-[var(--home-border)] py-8">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <blockquote className="max-w-xl">
            <p className="text-sm italic text-[var(--home-muted)]">
              &ldquo;Finally a platform built for how coaches actually work — not how athletes track workouts.&rdquo;
            </p>
            <footer className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--home-text)]">
              — Coach, Stockholm
            </footer>
          </blockquote>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--home-text)]">
              <span className="h-1.5 w-1.5 rounded-none bg-[var(--home-accent)]" />
              14-day free trial
            </span>
            <span className="inline-flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--home-text)]">
              <span className="h-1.5 w-1.5 rounded-none bg-[var(--home-accent)]" />
              No credit card required
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
