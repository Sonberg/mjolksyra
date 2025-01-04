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

  const element = (
    <div className="text-sm">
      <HoverCard>
        <HoverCardTrigger className="hover:underline hover:bg-zinc-900 py-1 px-2 text-sm flex justify-between items-center">
          <div ref={setNodeRef} {...listeners} {...attributes}>
            {exercise.name}
          </div>
          <Star className="h-4 hover:text-zinc-700 text-zinc-800" />
        </HoverCardTrigger>
        <HoverCardContent className="z-30">
          The React Framework – created and maintained by @vercel.
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
