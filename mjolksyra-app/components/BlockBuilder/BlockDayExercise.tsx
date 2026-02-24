"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, NotebookPenIcon, X } from "lucide-react";
import { BlockExercise } from "@/services/blocks/type";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";

type Props = {
  exercise: BlockExercise;
  blockWorkoutId: string;
  onRemove: () => void;
  onUpdateNote: (note: string | null) => void;
};

export function BlockDayExercise({
  exercise,
  blockWorkoutId,
  onRemove,
  onUpdateNote,
}: Props) {
  const [isOpen, setOpen] = useState(false);
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
      className={cn(
        "group rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs transition hover:border-zinc-700",
        { "border-zinc-600": isOpen }
      )}
    >
      <div className="flex items-center gap-1">
        <div
          {...listeners}
          {...attributes}
          className="shrink-0 cursor-grab text-zinc-500 hover:text-zinc-300"
        >
          <GripVertical className="h-3 w-3" />
        </div>
        <button
          type="button"
          className="flex-1 select-none truncate text-left text-zinc-200"
          title={exercise.name}
          onClick={() => setOpen((open) => !open)}
        >
          {exercise.name}
        </button>
        <button
          type="button"
          onClick={() => setOpen((open) => !open)}
          className={cn(
            "grid h-5 w-5 place-content-center rounded text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200",
            { "text-zinc-200": !!exercise.note }
          )}
          title="Add notes"
        >
          <NotebookPenIcon className="h-3 w-3" />
        </button>
        <button
          onClick={onRemove}
          className="shrink-0 text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:text-red-300"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {isOpen ? (
        <div className="mt-2 border-t border-zinc-800 pt-2">
          <Textarea
            value={exercise.note ?? ""}
            onChange={(ev) => onUpdateNote(ev.target.value || null)}
            placeholder="Add note for this exercise..."
            className="min-h-16 border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
      ) : null}
    </div>
  );
}
