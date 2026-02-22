"use client";

import { BlockWorkout } from "@/services/blocks/type";
import { BlockDay } from "./BlockDay";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  week: number;
  workouts: BlockWorkout[];
  onRemoveExercise: (week: number, dayOfWeek: number, exerciseId: string) => void;
};

export function BlockWeek({ week, workouts, onRemoveExercise }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/70 backdrop-blur-sm">
      <div className="flex select-none items-center justify-between border-b border-white/10 bg-zinc-900/80 px-3 py-2">
        <div className="text-sm font-semibold text-zinc-100">Week {week}</div>
        <div className="text-xs uppercase tracking-[0.14em] text-zinc-400">
          Block plan
        </div>
      </div>
      <div className="grid grid-cols-7 divide-x divide-white/10 border-b border-white/10 bg-zinc-900/40">
        <div className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">Mon</div>
        <div className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">Tue</div>
        <div className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">Wed</div>
        <div className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">Thu</div>
        <div className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">Fri</div>
        <div className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">Sat</div>
        <div className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">Sun</div>
      </div>
      <div className="grid grid-cols-7 divide-x divide-white/10">
        {DAY_NAMES.map((_, index) => {
          const dayOfWeek = index + 1;
          const workout = workouts.find(
            (w) => w.week === week && w.dayOfWeek === dayOfWeek
          );
          return (
            <BlockDay
              key={dayOfWeek}
              week={week}
              dayOfWeek={dayOfWeek}
              workout={workout}
              onRemoveExercise={(exerciseId) =>
                onRemoveExercise(week, dayOfWeek, exerciseId)
              }
            />
          );
        })}
      </div>
    </section>
  );
}
