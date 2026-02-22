"use client";

import { WorkoutPlannerDemo } from "@/components/WorkoutPlannerDemo/WorkoutPlannerDemo";

export const DemoSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-12">
          <h2 className="mb-4 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            Try our workout planner
          </h2>
          <p className="text-lg text-zinc-400">
            Experience our intuitive drag-and-drop interface
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-sm">
          <WorkoutPlannerDemo />
        </div>
      </div>
    </section>
  );
};
