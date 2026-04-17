"use client";

import { ArrowUpIcon, ArrowDownIcon, PlusIcon, XIcon } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
      <div className="shrink-0 border-b border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
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
            <Button
              variant="outline"
              size="sm"
              onClick={onAddExercise}
              className="rounded-none"
            >
              <PlusIcon data-icon="inline-start" />
              Add
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="size-8 rounded-none"
            >
              <XIcon data-icon />
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveExercise(index, "up")}
                    disabled={index === 0}
                    className="size-8 rounded-none"
                  >
                    <ArrowUpIcon data-icon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveExercise(index, "down")}
                    disabled={index === workout.exercises.length - 1}
                    className="size-8 rounded-none"
                  >
                    <ArrowDownIcon data-icon />
                  </Button>
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
