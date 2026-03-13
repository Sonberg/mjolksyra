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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
        rightSlot={
          <div className="mt-0.5 flex shrink-0 items-start">
            <DraggingToolTip
              header="Exercise"
              listeners={listeners}
              label={exercise.name}
              icon={
                <div className="grid h-5 w-5 place-content-center rounded-none text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]">
                  <EllipsisVertical className="h-3.5 w-3.5" />
                </div>
              }
              onDelete={() => {
                onRemove();
              }}
            />
          </div>
        }
      />
    </div>
  );
}
