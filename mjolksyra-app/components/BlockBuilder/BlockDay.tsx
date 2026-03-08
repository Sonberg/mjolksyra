"use client";

import { useDroppable, useDndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BlockWorkout } from "@/services/blocks/type";
import { BlockDayExercise } from "./BlockDayExercise";
import { cn } from "@/lib/utils";

type Props = {
  week: number;
  dayOfWeek: number;
  workout: BlockWorkout | undefined;
  onRemoveExercise: (exerciseId: string) => void;
  onAddExercise: () => void;
  isActiveWorkout: boolean;
};

export function BlockDay({
  week,
  dayOfWeek,
  workout,
  onRemoveExercise,
  onAddExercise,
  isActiveWorkout,
}: Props) {
  const id = `block-day-${week}-${dayOfWeek}`;
  const { active } = useDndContext();

  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: "blockDay",
      week,
      dayOfWeek,
    },
  });

  const isExerciseDragging =
    active?.data.current?.type === "exercise" ||
    active?.data.current?.type === "blockExercise";

  const hasExercises = (workout?.exercises.length ?? 0) > 0;

  return (
    <div className="flex min-h-32 flex-col p-2">
      <div
        ref={setNodeRef}
        className={cn(
          "relative flex h-full min-h-24 flex-1 flex-col rounded-none border border-transparent transition-colors",
          isOver && isExerciseDragging && "border-[var(--shell-accent)] bg-[var(--shell-accent)]/10",
        )}
      >
        {hasExercises ? (
          <>
            <SortableContext
              items={workout!.exercises.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              {workout!.exercises.map((exercise) => (
                <div key={exercise.id} className="mb-1 last:mb-0">
                  <BlockDayExercise
                    exercise={exercise}
                    blockWorkoutId={workout!.id}
                    onRemove={() => onRemoveExercise(exercise.id)}
                    isActive={isActiveWorkout}
                  />
                </div>
              ))}
            </SortableContext>
            <button
              type="button"
              onClick={onAddExercise}
              className="mt-2 inline-flex h-8 items-center rounded-none border-2 border-[var(--shell-surface-strong)] bg-[var(--shell-surface)] px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
            >
              Add exercise
            </button>
          </>
        ) : (
          <div
            onClick={onAddExercise}
            className="grid h-full min-h-32 cursor-pointer place-items-center rounded-none border border-dashed border-[var(--shell-border)] px-4 text-center text-xs text-[var(--shell-muted)] opacity-30 transition-all hover:opacity-100"
          >
            <div className="select-none">Drag &amp; drop exercises or click to add</div>
          </div>
        )}
      </div>
    </div>
  );
}
