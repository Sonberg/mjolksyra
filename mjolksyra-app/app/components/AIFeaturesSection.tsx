import { SparklesIcon, ScanSearchIcon } from "lucide-react";

export function AIFeaturesSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--home-muted)]">
            AI coaching tools
          </p>
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--home-text)] md:text-4xl">
            Let the AI do the heavy lifting
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--home-muted)]">
            Generate complete programs from a prompt, and analyze check-in
            footage to give athletes better feedback, faster.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* AI Planner */}
          <article className="border border-[var(--home-border)] bg-[var(--home-surface)] p-5">
            <div className="mb-4 inline-flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
              <SparklesIcon className="h-3.5 w-3.5" />
              AI Planner
            </div>

            <div className="border border-[var(--home-border)] bg-[var(--home-surface-strong)] p-3 space-y-2">
              {/* User message */}
              <div className="border border-[var(--home-border)] bg-[var(--home-surface)] px-2.5 py-2 text-xs text-[var(--home-text)]">
                "Build a 6-week powerlifting peaking block for an intermediate athlete, 4 days/week."
              </div>

              {/* AI response */}
              <div className="border border-[var(--home-border)] bg-[var(--home-accent)] px-2.5 py-2 text-xs text-[var(--home-accent-ink)] space-y-1">
                <p className="font-semibold">Got it. A few quick questions:</p>
                <p>Should I keep existing scheduled sessions or replace them?</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
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

              {/* Confirmation card */}
              <div className="border border-[var(--home-border)] bg-[var(--home-surface)] px-2.5 py-2 text-[11px] space-y-1.5">
                <p className="font-semibold uppercase tracking-[0.08em] text-[var(--home-muted)]">
                  Ready to generate
                </p>
                <div className="grid grid-cols-3 gap-2 text-[var(--home-text)]">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-[var(--home-muted)]">Start</span>
                    <span>May 5</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-[var(--home-muted)]">Weeks</span>
                    <span>6</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-[var(--home-muted)]">Conflicts</span>
                    <span>Replace</span>
                  </div>
                </div>
                <div className="pt-1 flex justify-end">
                  <span className="border border-transparent bg-[var(--home-accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--home-accent-ink)]">
                    Generate plan
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm text-[var(--home-muted)]">
              Describe a program in plain language. The AI asks clarifying questions and generates a full plan in seconds.
            </p>
          </article>

          {/* Workout Analysis */}
          <article className="border border-[var(--home-border)] bg-[var(--home-surface)] p-5">
            <div className="mb-4 inline-flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
              <ScanSearchIcon className="h-3.5 w-3.5" />
              Workout Analysis
            </div>

            <div className="border border-[var(--home-border)] bg-[var(--home-surface-strong)] p-3 space-y-2">
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
              <div className="space-y-2 text-[11px] text-[var(--home-muted)]">
                <div>
                  <span className="font-semibold uppercase tracking-widest text-[var(--home-text)]">Findings</span>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    <li>Back squat depth within 1–2 cm at 90% 1RM</li>
                    <li>Bench left elbow flares slightly on descent</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-widest text-[var(--home-text)]">Risks</span>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    <li>Elbow flare may stress anterior shoulder over time</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-widest text-[var(--home-text)]">Suggestions</span>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    <li>Add tempo squats (3-1-1) to reinforce depth habit</li>
                    <li>Cue "elbows in" on bench descent for 2 sessions</li>
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
