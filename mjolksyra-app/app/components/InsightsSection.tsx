import { BarChart2Icon, RefreshCwIcon } from "lucide-react";

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "emerald" | "amber" | "red" | "neutral";
}) {
  const colors = {
    emerald:
      "border border-[var(--home-border)] bg-[var(--home-surface-strong)] text-[var(--home-muted)]",
    amber:
      "border border-[var(--home-border)] bg-[var(--home-surface-strong)] text-[var(--home-text)]",
    red: "border-transparent bg-[var(--home-text)] text-[var(--home-surface)]",
    neutral:
      "border border-[var(--home-border)] bg-[var(--home-surface-strong)] text-[var(--home-muted)]",
  };
  return (
    <span
      className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${colors[variant]}`}
    >
      {children}
    </span>
  );
}

function AccordionRow({
  label,
  badge,
  children,
  open,
}: {
  label: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <div className="border-b border-[var(--home-border)] last:border-b-0">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--home-text)]">
          {label}
        </span>
        {badge}
        <span className="ml-auto text-[10px] text-[var(--home-muted)]">
          {open ? "▲" : "▼"}
        </span>
      </div>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
}

export function InsightsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--home-muted)]">
            Athlete intelligence
          </p>
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--home-text)] md:text-4xl">
            AI-powered insights for every athlete
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--home-muted)]">
            Let the AI analyze training history and surface what matters most —
            fatigue risk, progression trends, strengths, and coaching
            recommendations — so you can act instead of dig.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Left: mock insights accordion */}
          <article className="border border-[var(--home-border)] bg-[var(--home-surface)] p-5 lg:col-span-3">
            <div className="mb-4 inline-flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
              <BarChart2Icon className="h-3.5 w-3.5" />
              Athlete Insights
            </div>

            {/* Generated timestamp */}
            <p className="mb-3 text-[10px] uppercase tracking-widest text-[var(--home-muted)]">
              Last generated · 14 Apr 2026
            </p>

            {/* Accordion mock */}
            <div className="border border-[var(--home-border)] bg-[var(--home-surface-strong)] divide-y divide-[var(--home-border)]">
              {/* Athlete Profile — collapsed */}
              <AccordionRow
                label="Athlete Profile"
                badge={<Badge variant="neutral">Intermediate</Badge>}
                open={false}
              >
                {null}
              </AccordionRow>

              {/* Fatigue Risk — open */}
              <AccordionRow
                label="Fatigue Risk"
                badge={<Badge variant="amber">Medium</Badge>}
                open
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden bg-[var(--home-surface)]">
                      <div
                        className="h-full bg-[var(--home-text)]"
                        style={{ width: "58%" }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--home-text)]">
                      58
                    </span>
                  </div>
                  <p className="text-xs text-[var(--home-muted)]">
                    Accumulated volume over the past two weeks is above typical
                    baseline. Intensity on main lifts has also increased. Monitor
                    sleep quality and reduce accessory load if recovery drops.
                  </p>
                </div>
              </AccordionRow>

              {/* Progression — open */}
              <AccordionRow
                label="Progression"
                badge={<Badge variant="emerald">Improving</Badge>}
                open
              >
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[var(--home-muted)]">
                    All main lifts are trending upward over the past 8 weeks.
                    Squat and bench show consistent load increases with good
                    technical execution reported.
                  </p>
                  <ul className="divide-y divide-[var(--home-border)]">
                    {[
                      { name: "Back Squat", trend: "improving" as const, detail: "+7.5 kg over 8 weeks" },
                      { name: "Bench Press", trend: "improving" as const, detail: "+5 kg over 8 weeks" },
                      { name: "Romanian Deadlift", trend: "plateauing" as const, detail: "Load unchanged 3 weeks" },
                    ].map((ex) => (
                      <li
                        key={ex.name}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <span className="text-xs font-medium text-[var(--home-text)]">
                          {ex.name}
                        </span>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge
                            variant={
                              ex.trend === "improving"
                                ? "emerald"
                                : ex.trend === "plateauing"
                                  ? "amber"
                                  : "red"
                            }
                          >
                            {ex.trend}
                          </Badge>
                          <span className="text-[10px] text-[var(--home-muted)]">
                            {ex.detail}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionRow>

              {/* Strengths — collapsed */}
              <AccordionRow label="Strengths" open={false}>
                {null}
              </AccordionRow>

              {/* Areas to Improve — collapsed */}
              <AccordionRow label="Areas to Improve" open={false}>
                {null}
              </AccordionRow>

              {/* Recommendations — open */}
              <AccordionRow label="Recommendations" open>
                <ul className="flex flex-col gap-3">
                  {[
                    {
                      priority: "high" as const,
                      label: "Reduce accessory volume this week",
                      detail:
                        "Fatigue score is elevated. Drop isolation work by 30% to allow recovery before next intensity block.",
                    },
                    {
                      priority: "medium" as const,
                      label: "Add tempo work to RDL",
                      detail:
                        "Plateau on Romanian deadlift suggests a technique or stimulus change. Try 3-1-1 tempo for 2 sessions.",
                    },
                  ].map((r) => (
                    <li key={r.label} className="flex items-start gap-3">
                      <Badge
                        variant={
                          r.priority === "high"
                            ? "red"
                            : r.priority === "medium"
                              ? "amber"
                              : "neutral"
                        }
                      >
                        {r.priority}
                      </Badge>
                      <div>
                        <p className="text-xs font-semibold text-[var(--home-text)]">
                          {r.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[var(--home-muted)]">
                          {r.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionRow>
            </div>
          </article>

          {/* Right: description + controls */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <article className="border border-[var(--home-border)] bg-[var(--home-surface)] p-5">
              <p className="text-sm text-[var(--home-muted)]">
                The AI reads every completed workout — sets, reps, load, and
                coach notes — and produces a full report you can share with the
                athlete or keep for your own use.
              </p>

              <ul className="mt-4 flex flex-col gap-3">
                {[
                  {
                    label: "Fatigue risk score",
                    detail: "Auto-calculated from the last 12 weeks of training load",
                  },
                  {
                    label: "Per-exercise progression",
                    detail: "Improving, plateauing, or declining trend for each main lift",
                  },
                  {
                    label: "Prioritized recommendations",
                    detail: "Actionable coaching cues ranked by urgency",
                  },
                ].map((item) => (
                  <li key={item.label} className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--home-text)]">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-[var(--home-muted)]">
                      {item.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            {/* Coach controls mock */}
            <article className="border border-[var(--home-border)] bg-[var(--home-surface)] p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
                Coach controls
              </p>

              {/* Visibility toggle row */}
              <div className="mb-3 flex items-center justify-between border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-3 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-[var(--home-text)]">
                    Visible to athlete
                  </p>
                  <p className="text-[10px] text-[var(--home-muted)]">
                    Share report in athlete portal
                  </p>
                </div>
                {/* Static toggle — on */}
                <div className="relative h-5 w-9 shrink-0">
                  <div className="h-5 w-9 rounded-full bg-[var(--home-accent)]" />
                  <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
                </div>
              </div>

              {/* Rebuild button */}
              <button
                type="button"
                aria-disabled="true"
                tabIndex={-1}
                className="inline-flex w-full cursor-default items-center justify-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--home-text)]"
              >
                <RefreshCwIcon className="h-3.5 w-3.5" />
                Rebuild insights
              </button>
              <p className="mt-2 text-[10px] text-[var(--home-muted)]">
                Costs 1 credit · requires 3+ completed workouts
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
