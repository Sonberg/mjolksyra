"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { BlockExercise } from "@/services/blocks/type";

type Props = {
  exercise: BlockExercise;
  blockWorkoutId: string;
  onRemove: () => void;
};

export function BlockDayExercise({ exercise, blockWorkoutId, onRemove }: Props) {
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
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/70 px-2 py-1.5 text-xs transition hover:border-cyan-200/20 hover:bg-zinc-900"
    >
      <div
        {...listeners}
        {...attributes}
        className="shrink-0 cursor-grab text-zinc-500 hover:text-zinc-300"
      >
        <GripVertical className="h-3 w-3" />
      </div>
      <span className="flex-1 select-none truncate text-zinc-200">{exercise.name}</span>
      <button
        onClick={onRemove}
        className="shrink-0 text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:text-red-300"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
