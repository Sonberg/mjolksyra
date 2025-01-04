import { useDraggable, DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { DraggingExercise } from "../DraggingExercise";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Star } from "lucide-react";
import { Exercise } from "@/api/exercises/type";
import { useStarredExercises } from "./hooks/useStarredExercises";
import { useCallback, useMemo } from "react";
import { capitalizeFirstLetter } from "@/lib/capitalizeFirstLetter";

type Props = {
  exercise: Exercise;
};

export function ExerciseRow({ exercise }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: exercise.id,
    data: {
      exerciseId: exercise.id,
      name: exercise.name,
      source: "library",
      type: "exercise",
    },
  });

  const starred = useStarredExercises();
  const isStarred = useMemo(
    () => starred.data?.find((x) => x.id == exercise.id),
    [exercise, starred.data]
  );

  const hoverCard = useCallback((title: string, value: string | null) => {
    if (!value) {
      return null;
    }

    return (
      <div className="border py-1 px-2 rounded">
        <div className="font-bold text-xs mb-1">{title}</div>
        <div className="text-xs">{capitalizeFirstLetter(value)}</div>
      </div>
    );
  }, []);

  const element = (
    <div className="text-sm border-b">
      <HoverCard openDelay={300}>
        <div className="hover:underline py-2 text-sm flex justify-between items-center">
          <HoverCardTrigger>
            <div
              ref={setNodeRef}
              {...listeners}
              {...attributes}
              className="cursor-move"
            >
              {exercise.name}
            </div>
          </HoverCardTrigger>
          <Star
            fill={isStarred ? "#FFF" : undefined}
            onClick={() =>
              isStarred
                ? starred.unstar(exercise.id)
                : starred.star(exercise.id)
            }
            className="h-5 hover:text-zinc-700 text-zinc-800 cursor-pointer"
          />
        </div>
        <HoverCardContent className="z-30">
          <div className="font-bold mb-2">{exercise.name}</div>
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
  );

  return (
    <>
      {element}
      {isDragging
        ? createPortal(
            <DragOverlay>
              <DraggingExercise name={exercise.name} />
            </DragOverlay>,
            document.body
          )
        : null}
    </>
  );
}
