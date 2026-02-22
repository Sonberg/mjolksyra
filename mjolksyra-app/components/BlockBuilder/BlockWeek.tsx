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
    <div>
      <div className="p-1 px-2 text-sm select-none border bg-accent">
        Week {week}
      </div>
      <div className="grid grid-cols-7">
        <div className="border-l border-b border-t px-1 py-0.5 text-xs text-center font-semibold text-muted-foreground">Mon</div>
        <div className="border-l border-b border-t px-1 py-0.5 text-xs text-center font-semibold text-muted-foreground">Tue</div>
        <div className="border-l border-b border-t px-1 py-0.5 text-xs text-center font-semibold text-muted-foreground">Wed</div>
        <div className="border-l border-b border-t px-1 py-0.5 text-xs text-center font-semibold text-muted-foreground">Thu</div>
        <div className="border-l border-b border-t px-1 py-0.5 text-xs text-center font-semibold text-muted-foreground">Fri</div>
        <div className="border-l border-b border-t px-1 py-0.5 text-xs text-center font-semibold text-muted-foreground">Sat</div>
        <div className="border-l border-b border-r border-t px-1 py-0.5 text-xs text-center font-semibold text-muted-foreground">Sun</div>
      </div>
      <div className="grid grid-cols-7 border-r">
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
    </div>
  );
}
