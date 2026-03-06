"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { BlockExercise } from "@/services/blocks/type";
import { ExerciseCard } from "@/components/ExerciseCard";

type Props = {
  exercise: BlockExercise;
  blockWorkoutId: string;
  onRemove: () => void;
  onEdit: () => void;
  isActive: boolean;
};

export function BlockDayExercise({
  exercise,
  blockWorkoutId,
  onRemove,
  onEdit,
  isActive,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: exercise.id,
      data: {
        type: "blockExercise",
        exercise,
        blockWorkoutId,
        label: exercise.name,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ExerciseCard
        name={exercise.name}
        prescription={exercise.prescription ?? null}
        isActive={isActive}
        isDragging={isDragging}
        onClick={onEdit}
        leftSlot={
          <div
            {...listeners}
            className="shrink-0 cursor-grab pt-1 text-[var(--shell-muted)] hover:text-[var(--shell-ink)]"
          >
            <GripVertical className="h-3 w-3" />
          </div>
        }
        rightSlot={
          <div className="mt-0.5 flex items-center gap-1">
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                onRemove();
              }}
              className="grid h-5 w-5 place-content-center rounded-none text-[var(--shell-muted)] opacity-0 transition hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-accent)] group-hover:opacity-100"
              title="Remove exercise"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        }
      />
    </div>
  );
}
