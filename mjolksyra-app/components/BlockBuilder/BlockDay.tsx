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
};

export function BlockDay({ week, dayOfWeek, workout, onRemoveExercise }: Props) {
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
        "flex min-h-32 flex-col p-2 transition-colors",
        {
          "bg-cyan-300/10": isOver && isExerciseDragging,
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
            />
          ))}
        </SortableContext>
      ) : (
        <div
          className={cn(
            "grid flex-1 place-items-center rounded-lg border border-dashed border-white/10 text-center text-xs text-zinc-500 opacity-0 transition-all hover:opacity-100",
            { "opacity-100": isOver && isExerciseDragging }
          )}
        >
          Drop exercises
        </div>
      )}
    </div>
  );
}
