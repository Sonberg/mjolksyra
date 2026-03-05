"use client";

import { WorkoutPlannerDemo } from "@/components/WorkoutPlannerDemo/WorkoutPlannerDemo";

export const DemoSection = () => {
  return (
    <section className="py-20 lg:py-32">
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
        <div className="rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-6">
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
        <div className="overflow-hidden rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)]">
          <div className="pointer-events-none select-none">
            <WorkoutPlannerDemo />
          </div>
        </div>
      </div>
    </section>
  );
};
