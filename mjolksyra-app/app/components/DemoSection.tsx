"use client";

import { WorkoutPlannerDemo } from "@/components/WorkoutPlannerDemo/WorkoutPlannerDemo";
import { useState } from "react";

export const DemoSection = () => {
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  return (
    <section id="planner-demo" className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-12">
          <h2 className="font-[var(--font-display)] mb-4 text-3xl text-[var(--home-text)] md:text-4xl">
            Try our workout planner
          </h2>
          <p className="text-lg text-[var(--home-muted)]">
            Experience our intuitive drag-and-drop interface
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-screen-2xl px-4 md:hidden">
        <div className="rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--home-muted)]">
            Planner Demo
          </p>
          <h3 className="mt-2 text-xl text-[var(--home-text)]">
            Best viewed on desktop
          </h3>
          <p className="mt-3 text-[var(--home-muted)]">
            Open Mjolksyra on a desktop or larger screen to try the full
            workout planner demo.
          </p>
        </div>
      </div>
      <div className="mx-auto hidden max-w-screen-2xl px-4 md:block">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setIsDemoRunning((state) => !state)}
            className="rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--home-text)] transition hover:bg-[var(--home-surface-strong)]"
          >
            {isDemoRunning ? "Stop demo" : "Start demo"}
          </button>
        </div>

        <div className="relative h-[78vh] max-h-[78vh] overflow-hidden rounded-none border border-[var(--home-border)] bg-[var(--home-surface)]">
          <div className={`h-full ${isDemoRunning ? "" : "pointer-events-none select-none"}`}>
            <WorkoutPlannerDemo />
          </div>

          {!isDemoRunning ? (
            <div className="absolute inset-0 z-40 grid place-items-center bg-zinc-500/40">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
                  Demo paused
                </div>
                <button
                  type="button"
                  onClick={() => setIsDemoRunning(true)}
                  className="rounded-none border border-transparent bg-[var(--home-accent)] px-8 py-3 text-base font-semibold uppercase tracking-[0.08em] text-[var(--home-accent-ink)] transition hover:bg-[var(--home-accent-hover)]"
                >
                  Start demo
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
