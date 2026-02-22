"use client";

import { useDroppable, useDndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BlockExercise, BlockWorkout } from "@/services/blocks/type";
import { BlockDayExercise } from "./BlockDayExercise";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
        "border-l border-b min-h-24 flex flex-col p-1 transition-colors",
        {
          "bg-accent/50": isOver && isExerciseDragging,
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
            "flex-1 grid place-items-center text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-all text-center",
            { "opacity-100": isOver && isExerciseDragging }
          )}
        >
          {DAY_NAMES[dayOfWeek - 1]}
        </div>
      )}
    </div>
  );
}
