import { useDraggable, DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { DraggingExercise } from "../DraggingExercise";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Exercise } from "@/api/exercises/type";
import { useCallback, useId, useMemo } from "react";
import { capitalizeFirstLetter } from "@/lib/capitalizeFirstLetter";
import { ExerciseRowStar } from "./ExerciseRowStar";
import { ExerciseRowDelete } from "./ExerciseRowDelete";

type Props = {
  exercise: Exercise;
};

export function ExerciseRow({ exercise }: Props) {
  const id = useId();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: exercise.id + id,
    data: {
      exercise: exercise,
      source: "library",
      type: "exercise",
    },
  });

  const hoverCard = useCallback((title: string, value: string | null) => {
    if (!value) {
      return null;
    }

    return (
      <div className="border py-1 px-2 rounded">
        <div className="font-bold text-sm mb-1">{title}</div>
        <div className="text-xs">{capitalizeFirstLetter(value)}</div>
      </div>
    );
  }, []);

  return useMemo(
    () => (
      <>
        <div className="text-sm border-b">
          <HoverCard openDelay={500}>
            <div className="hover:underline py-2 text-sm flex justify-between items-center">
              <HoverCardTrigger>
                <div
                  ref={setNodeRef}
                  {...listeners}
                  {...attributes}
                  className="cursor-move select-none"
                >
                  {exercise.name}
                </div>
              </HoverCardTrigger>
              <div className="flex gap-1">
                <ExerciseRowDelete exercise={exercise} />
                <ExerciseRowStar exercise={exercise} />
              </div>
            </div>
            <HoverCardContent className="z-30">
              <div className="font-bold mb-4">{exercise.name}</div>
              <div className="grid gap-2 grid-cols-2">
                {hoverCard("Category", exercise.category)}
                {hoverCard("Equipment", exercise.equipment)}
                {hoverCard("Force", exercise.force)}
                {hoverCard("Level", exercise.level)}
                {hoverCard("Mechanic", exercise.mechanic)}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        {isDragging
          ? createPortal(
              <DragOverlay>
                <DraggingExercise name={exercise.name} />
              </DragOverlay>,
              document.body
            )
          : null}
      </>
    ),
    [isDragging, exercise, listeners, attributes, hoverCard, setNodeRef]
  );
}
