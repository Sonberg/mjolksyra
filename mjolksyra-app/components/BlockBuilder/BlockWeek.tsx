"use client";

import { BlockWorkout } from "@/services/blocks/type";
import { BlockDay } from "./BlockDay";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  week: number;
  workouts: BlockWorkout[];
  onRemoveExercise: (week: number, dayOfWeek: number, exerciseId: string) => void;
  onEditExercise: (week: number, dayOfWeek: number, exerciseId: string) => void;
  activeExerciseId: string | null;
  mode: "arrange" | "edit";
};

export function BlockWeek({
  week,
  workouts,
  onRemoveExercise,
  onEditExercise,
  activeExerciseId,
  mode,
}: Props) {
  return (
    <section className="overflow-hidden rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)]/95 backdrop-blur-sm">
      <div className="flex select-none items-center justify-between border-b-2 border-[var(--shell-border)]/30 bg-[var(--shell-surface-strong)]/70 px-3 py-2">
        <div className="text-sm font-semibold text-[var(--shell-ink)]">Week {week}</div>
        <div className="text-xs uppercase tracking-[0.14em] text-[var(--shell-muted)]">
          Block plan
        </div>
      </div>
      <div className="grid grid-cols-7 divide-x divide-[var(--shell-border)]/20 border-b-2 border-[var(--shell-border)]/20 bg-[var(--shell-surface-strong)]/45">
        {DAY_NAMES.map((dayName, index) => {
          const dayOfWeek = index + 1;
          const workout = workouts.find(
            (w) => w.week === week && w.dayOfWeek === dayOfWeek
          );
          const firstExercise = workout?.exercises[0] ?? null;

          return (
            <div
              key={`day-header-${dayOfWeek}`}
              className="flex items-center justify-center gap-1 px-2 py-1"
            >
              <div className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
                {dayName}
              </div>
              {mode === "edit" && !firstExercise ? (
                <span
                  className="h-4 w-4"
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 divide-x divide-[var(--shell-border)]/20">
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
              onEditExercise={(exerciseId) =>
                onEditExercise(week, dayOfWeek, exerciseId)
              }
              activeExerciseId={activeExerciseId}
              mode={mode}
            />
          );
        })}
      </div>
    </section>
  );
}
