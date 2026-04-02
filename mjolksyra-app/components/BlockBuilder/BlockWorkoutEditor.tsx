"use client";

import { ArrowUpIcon, ArrowDownIcon, PlusIcon, XIcon } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { BlockWorkout } from "@/services/blocks/type";
import { ExercisePrescription } from "@/lib/exercisePrescription";
import { ExercisePrescriptionEditor } from "@/components/ExercisePrescriptionEditor";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Props = {
  workout: BlockWorkout;
  onUpdate: (workout: BlockWorkout) => void;
  onAddExercise: () => void;
  onClose: () => void;
};

export function BlockWorkoutEditor({ workout, onUpdate, onAddExercise, onClose }: Props) {
  const dayName = DAY_NAMES[workout.dayOfWeek - 1] ?? "";

  function updateExercise(
    exerciseId: string,
    patch: Partial<{ note: string | null; prescription: ExercisePrescription | null }>,
  ) {
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, ...patch } : ex,
      ),
    });
  }

  function moveExercise(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    onUpdate({
      ...workout,
      exercises: arrayMove(workout.exercises, index, target),
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
              Week {workout.week}
            </div>
            <div className="mt-0.5 text-lg font-semibold text-[var(--shell-ink)]">
              {dayName}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onAddExercise}
              className="inline-flex items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-content-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-muted)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {workout.exercises.map((exercise, index) => (
            <article
              key={exercise.id}
              className="overflow-hidden rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
                    Exercise
                  </p>
                  <div className="truncate font-[var(--font-display)] text-base text-[var(--shell-ink)]">
                    {index + 1}.{"  "}
                    {exercise.name}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveExercise(index, "up")}
                    disabled={index === 0}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)]",
                      index === 0
                        ? "opacity-40"
                        : "cursor-pointer hover:bg-[var(--shell-surface)]",
                    )}
                  >
                    <ArrowUpIcon className="h-4 w-4 text-[var(--shell-ink)]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveExercise(index, "down")}
                    disabled={index === workout.exercises.length - 1}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)]",
                      index === workout.exercises.length - 1
                        ? "opacity-40"
                        : "cursor-pointer hover:bg-[var(--shell-surface)]",
                    )}
                  >
                    <ArrowDownIcon className="h-4 w-4 text-[var(--shell-ink)]" />
                  </button>
                </div>
              </div>

              <Textarea
                value={exercise.note ?? ""}
                onChange={(ev) =>
                  updateExercise(exercise.id, { note: ev.target.value || null })
                }
                placeholder="Add note for this exercise..."
                className="mb-3 min-h-16 w-full resize-y rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus-visible:ring-[var(--shell-accent)]"
              />

              <ExercisePrescriptionEditor
                prescription={exercise.prescription ?? null}
                exerciseId={exercise.id}
                onChange={(prescription) =>
                  updateExercise(exercise.id, { prescription })
                }
                size="sm"
              />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
