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
  onEditExercise: (exerciseId: string) => void;
  activeExerciseId: string | null;
  mode: "arrange" | "edit";
};

export function BlockDay({
  week,
  dayOfWeek,
  workout,
  onRemoveExercise,
  onEditExercise,
  activeExerciseId,
  mode,
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

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-32 flex-col gap-1.5 p-2 transition-colors",
        {
          "bg-[var(--shell-accent)]/10": isOver && isExerciseDragging,
        }
      )}
    >
      {workout ? (
        <SortableContext
          items={workout.exercises.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          {workout.exercises.map((exercise) => (
            <BlockDayExercise
              key={exercise.id}
              exercise={exercise}
              blockWorkoutId={workout.id}
              onRemove={() => onRemoveExercise(exercise.id)}
              onEdit={() => onEditExercise(exercise.id)}
              isActive={activeExerciseId === exercise.id}
              mode={mode}
            />
          ))}
        </SortableContext>
      ) : (
        <div
          className={cn(
            "grid flex-1 place-items-center rounded-none border-2 border-dashed border-[var(--shell-border)]/40 text-center text-xs text-[var(--shell-muted)] opacity-0 transition-all hover:opacity-100",
            { "opacity-100": isOver && isExerciseDragging }
          )}
        >
          Drop exercises
        </div>
      )}
    </div>
  );
}
