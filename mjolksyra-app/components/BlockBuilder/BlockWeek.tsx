"use client";

import { BlockWorkout } from "@/services/blocks/type";
import { BlockDay } from "./BlockDay";
import { PencilIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  week: number;
  workouts: BlockWorkout[];
  onRemoveExercise: (week: number, dayOfWeek: number, exerciseId: string) => void;
  onEditExercise: (week: number, dayOfWeek: number) => void;
  onAddExercise: (week: number, dayOfWeek: number) => void;
  selectedWorkout: { week: number; dayOfWeek: number } | null;
};

export function BlockWeek({
  week,
  workouts,
  onRemoveExercise,
  onEditExercise,
  onAddExercise,
  selectedWorkout,
}: Props) {
  return (
    <section className="overflow-hidden rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)]">
      <div className="flex select-none items-center justify-between border-b-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
        <div className="text-sm font-semibold text-[var(--shell-ink)]">Week {week}</div>
      </div>
      <div className="grid grid-cols-7 divide-x divide-[var(--shell-border)] border-b-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)]">
        {DAY_NAMES.map((dayName, index) => {
          const dayOfWeek = index + 1;
          const workout = workouts.find(
            (w) => w.week === week && w.dayOfWeek === dayOfWeek,
          );
          const isActiveWorkout =
            selectedWorkout?.week === week && selectedWorkout?.dayOfWeek === dayOfWeek;

          return (
            <div
              key={`day-header-${dayOfWeek}`}
              className="flex items-center justify-between gap-1 px-2 py-1"
            >
              <div className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
                {dayName}
              </div>
              {workout ? (
                <button
                  type="button"
                  className={cn(
                    "grid h-6 w-6 place-content-center rounded-none text-[var(--shell-muted)] transition",
                    isActiveWorkout
                      ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
                      : "hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)]",
                  )}
                  onClick={() => onEditExercise(week, dayOfWeek)}
                  title={isActiveWorkout ? "Close editor" : "Edit workout"}
                  aria-label={isActiveWorkout ? "Close editor" : "Edit workout"}
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span className="h-6 w-6" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 divide-x divide-[var(--shell-border)]">
        {DAY_NAMES.map((_, index) => {
          const dayOfWeek = index + 1;
          const workout = workouts.find(
            (w) => w.week === week && w.dayOfWeek === dayOfWeek,
          );
          const isActiveWorkout =
            selectedWorkout?.week === week && selectedWorkout?.dayOfWeek === dayOfWeek;
          return (
            <BlockDay
              key={dayOfWeek}
              week={week}
              dayOfWeek={dayOfWeek}
              workout={workout}
              onRemoveExercise={(exerciseId) =>
                onRemoveExercise(week, dayOfWeek, exerciseId)
              }
              onAddExercise={() => onAddExercise(week, dayOfWeek)}
              isActiveWorkout={isActiveWorkout}
            />
          );
        })}
      </div>
    </section>
  );
}
