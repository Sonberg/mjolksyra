"use client";

import { WorkoutPlannerDemo } from "@/components/WorkoutPlannerDemo/WorkoutPlannerDemo";

export const DemoSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-12">
          <h2 className="font-[var(--font-display)] mb-4 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
            Try our workout planner
          </h2>
          <p className="text-lg text-zinc-400">
            Experience our intuitive drag-and-drop interface
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-screen-2xl px-4 md:hidden">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Planner Demo
          </p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-100">
            Best viewed on desktop
          </h3>
          <p className="mt-3 text-zinc-400">
            Open Mjolksyra on a desktop or larger screen to try the full
            workout planner demo.
          </p>
        </div>
      </div>
      <div className="mx-auto hidden max-w-screen-2xl px-4 md:block">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90">
          <div className="pointer-events-none select-none">
            <WorkoutPlannerDemo />
          </div>
        </div>
      </div>
    </section>
  );
};
