
const previewWeeks = [
  { week: "Week 1", focus: "Foundation", sessions: ["Squat", "Bench", "Pull"] },
  {
    week: "Week 2",
    focus: "Build",
    sessions: ["Volume", "Power", "Accessories"],
  },
  {
    week: "Week 3",
    focus: "Peak",
    sessions: ["Heavy Singles", "Speed Work", "Technique"],
  },
  {
    week: "Week 4",
    focus: "Deload",
    sessions: ["Recovery", "Mobility", "Low Intensity"],
  },
];

export function BlockBuilderPreviewSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-none border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--home-text)]">
              <span className="h-1.5 w-1.5 rounded-none bg-[var(--home-accent)]" />
              New Preview
            </p>
            <h2 className="font-[var(--font-display)] text-3xl text-[var(--home-text)] md:text-4xl">
              Create Reusable Training Blocks
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[var(--home-muted)]">
              Build week-by-week block templates in one place, then apply them in
              the athlete planner and adjust sessions as needed.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {previewWeeks.map((item) => (
              <article
                key={item.week}
                className="rounded-none border border-[var(--home-border)] bg-[var(--home-surface-strong)] p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base text-[var(--home-text)]">
                    {item.week}
                  </h3>
                  <span className="rounded-none bg-[var(--home-surface)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--home-muted)]">
                    {item.focus}
                  </span>
                </div>
                <div className="space-y-2">
                  {item.sessions.map((session) => (
                    <div
                      key={session}
                      className="rounded-none border border-[var(--home-border)]/35 bg-[var(--home-surface)] px-3 py-2 text-sm text-[var(--home-text)]"
                    >
                      {session}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
