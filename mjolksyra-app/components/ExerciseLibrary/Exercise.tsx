import { useDraggable, DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { DraggingExercise } from "../DraggingExercise";

type Props = {
  id: string;
  name: string;
};

export function Exercise({ id, name }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        exerciseId: id,
        name: name,
        source: "library",
        type: "exercise",
      },
    });

  const element = (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="z-10 bg-background text-sm"
    >
      {name}
    </div>
  );

  return (
    <>
      {isDragging
        ? createPortal(
            <DragOverlay>
              <DraggingExercise name={name} />
            </DragOverlay>,
            document.body
          )
        : element}
    </>
  );
}
