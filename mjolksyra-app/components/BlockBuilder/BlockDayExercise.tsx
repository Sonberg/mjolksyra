"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EllipsisVertical } from "lucide-react";
import { BlockExercise } from "@/services/blocks/type";
import { ExerciseCard } from "@/components/ExerciseCard";
import { DraggingToolTip } from "@/components/DraggingToolTip";

type Props = {
  exercise: BlockExercise;
  blockWorkoutId: string;
  onRemove: () => void;
  isActive: boolean;
};

export function BlockDayExercise({
  exercise,
  blockWorkoutId,
  onRemove,
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
        leftSlot={
          <DraggingToolTip
            listeners={listeners}
            icon={<EllipsisVertical className="h-4 text-[var(--shell-muted)]" />}
            onDelete={() => {
              onRemove();
            }}
          />
        }
      />
    </div>
  );
}
