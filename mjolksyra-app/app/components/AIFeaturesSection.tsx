import { PaperclipIcon, SparklesIcon, ScanSearchIcon } from "lucide-react";

const proposalWeeks = [
  {
    week: "Week 1",
    focus: "Accumulation",
    sessions: [
      { day: "Mon", name: "Squat + Bench", count: 8 },
      { day: "Wed", name: "Deadlift + OHP", count: 7 },
      { day: "Fri", name: "Squat + Bench", count: 8 },
      { day: "Sat", name: "Accessory", count: 6 },
    ],
  },
  {
    week: "Week 2",
    focus: "Accumulation",
    sessions: [
      { day: "Mon", name: "Squat + Bench", count: 8 },
      { day: "Wed", name: "Deadlift + OHP", count: 7 },
      { day: "Fri", name: "Squat + Bench", count: 8 },
      { day: "Sat", name: "Accessory", count: 6 },
    ],
  },
  {
    week: "Week 3",
    focus: "Intensification",
    sessions: [
      { day: "Mon", name: "Squat + Bench", count: 7 },
      { day: "Wed", name: "Deadlift + OHP", count: 6 },
      { day: "Fri", name: "Heavy Squat", count: 5 },
      { day: "Sat", name: "Bench + Pull", count: 6 },
    ],
  },
];

export function AIFeaturesSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--home-muted)]">
            AI coaching tools
          </p>
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--home-text)] md:text-4xl">
            AI tools for workout planning and athlete review
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--home-muted)]">
            Use an approval-first AI workout planner to stage block changes,
            then review athlete check-in media with structured feedback and
            coaching cues.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* AI Planner */}
          <article className="border border-[var(--home-border)] bg-[var(--home-surface)] p-5">
            <div className="mb-4 inline-flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
              <SparklesIcon className="h-3.5 w-3.5" />
              AI Planner
            </div>

            <div className="border border-[var(--home-border)] bg-[var(--home-surface-strong)] p-3 flex flex-col gap-2">
              {/* User message with file attachment hint */}
              <div className="border border-[var(--home-border)] bg-[var(--home-surface)] px-2.5 py-2 text-xs text-[var(--home-text)] flex flex-col gap-1.5">
                <p>&quot;Build a 6-week powerlifting peaking block for an intermediate athlete, 4 days/week.&quot;</p>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--home-muted)]">
                  <PaperclipIcon className="h-3 w-3 shrink-0" />
                  <span className="font-semibold uppercase tracking-[0.08em]">athlete_history.xlsx</span>
                  <span className="opacity-60">attached</span>
                </div>
              </div>

              {/* AI clarifying response */}
              <div className="flex flex-col gap-1 border border-[var(--home-border)] bg-[var(--home-accent)] px-2.5 py-2 text-xs text-[var(--home-accent-ink)]">
                <p className="font-semibold">Got it. Should I keep existing sessions or replace them?</p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {["Keep existing", "Replace all", "Append only"].map((opt) => (
                    <span
                      key={opt}
                      className="border border-[var(--home-accent-ink)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] opacity-70"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Proposal review */}
              <div className="border border-[var(--home-border)] bg-[var(--home-surface)] px-2.5 py-2.5 flex flex-col gap-2.5">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--home-muted)]">
                    Proposed plan
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--home-muted)]">
                    <span className="font-semibold uppercase tracking-[0.08em]">6 weeks</span>
                    <span className="font-mono font-semibold text-[var(--home-text)]">2.5 cr</span>
                  </div>
                </div>

                {/* Week rows */}
                <div className="flex flex-col gap-1.5">
                  {proposalWeeks.map((w) => (
                    <div key={w.week} className="border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--home-text)]">
                          {w.week}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--home-muted)]">
                          {w.focus}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                        {w.sessions.map((s) => (
                          <div key={s.day} className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold uppercase tracking-[0.06em] text-[var(--home-muted)] w-6 shrink-0">{s.day}</span>
                            <span className="text-[var(--home-text)] flex-1 truncate px-1">{s.name}</span>
                            <span className="font-mono text-[var(--home-muted)] shrink-0">{s.count}ex</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Remaining weeks indicator */}
                  <div className="px-2.5 py-1.5 text-[10px] text-[var(--home-muted)] text-center uppercase tracking-widest border border-dashed border-[var(--home-border)]">
                    + 3 more weeks
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-0.5">
                  <span className="border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--home-muted)]">
                    Discard
                  </span>
                  <span className="border border-transparent bg-[var(--home-accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--home-accent-ink)]">
                    Apply plan
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm text-[var(--home-muted)]">
              Describe a program in plain language, attach context files, and review the full plan before it&apos;s applied — one session at a time or all at once.
            </p>
          </article>

          {/* Workout Analysis */}
          <article className="border border-[var(--home-border)] bg-[var(--home-surface)] p-5">
            <div className="mb-4 inline-flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
              <ScanSearchIcon className="h-3.5 w-3.5" />
              Workout Analysis
            </div>

            <div className="border border-[var(--home-border)] bg-[var(--home-surface-strong)] p-3 flex flex-col gap-2">
              {/* Summary block */}
              <div className="border-l-2 border-[var(--home-accent)] pl-3">
                <p className="text-xs font-medium text-[var(--home-text)]">
                  Solid session overall. Bar path is consistent on squat, but depth is marginal at heavier loads. Bench lockout shows some left-right asymmetry.
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--home-muted)]">
                  Last analyzed · just now
                </p>
              </div>

              {/* Findings / Risks / Suggestions */}
              <div className="flex flex-col gap-2 text-[11px] text-[var(--home-muted)]">
                <div>
                  <span className="font-semibold uppercase tracking-widest text-[var(--home-text)]">Findings</span>
                  <ul className="mt-1 list-disc pl-4 flex flex-col gap-0.5">
                    <li>Back squat depth within 1–2 cm at 90% 1RM</li>
                    <li>Bench left elbow flares slightly on descent</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-widest text-[var(--home-text)]">Risks</span>
                  <ul className="mt-1 list-disc pl-4 flex flex-col gap-0.5">
                    <li>Elbow flare may stress anterior shoulder over time</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-widest text-[var(--home-text)]">Suggestions</span>
                  <ul className="mt-1 list-disc pl-4 flex flex-col gap-0.5">
                    <li>Add tempo squats (3-1-1) to reinforce depth habit</li>
                    <li>Cue &quot;elbows in&quot; on bench descent for 2 sessions</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm text-[var(--home-muted)]">
              Upload check-in video and get structured technique feedback — findings, risks, and coaching cues — powered by AI.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
