"use client";

import { WorkoutPlannerDemo } from "@/components/WorkoutPlannerDemo/WorkoutPlannerDemo";

export const DemoSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
            Try our workout planner
          </h2>
          <p className="text-gray-400 text-lg">
            Experience our intuitive drag-and-drop interface
          </p>
        </div>
      </div>
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="rounded-xl border border-gray-800/50 bg-gray-950/50 backdrop-blur-sm overflow-hidden">
          <WorkoutPlannerDemo />
        </div>
      </div>
    </section>
  );
};
