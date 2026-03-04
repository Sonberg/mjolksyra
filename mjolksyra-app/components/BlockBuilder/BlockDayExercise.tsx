"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { BlockExercise } from "@/services/blocks/type";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatPrescription } from "@/lib/exercisePrescription";

type Props = {
  exercise: BlockExercise;
  blockWorkoutId: string;
  onRemove: () => void;
  onEdit: () => void;
  isActive: boolean;
  mode: "arrange" | "edit";
};

export function BlockDayExercise({
  exercise,
  blockWorkoutId,
  onRemove,
  onEdit,
  isActive,
  mode,
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
    opacity: isDragging ? 0.4 : 1,
  };
  const summary = useMemo(
    () => formatPrescription(exercise.prescription),
    [exercise.prescription],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={mode === "edit" ? onEdit : undefined}
      className={cn(
        "group rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1.5 text-xs transition",
        isActive ? "border-[var(--shell-accent)]" : "hover:bg-[var(--shell-surface-strong)]",
        {
          "cursor-pointer": mode === "edit",
        },
      )}
    >
      <div className="flex items-start gap-1">
        {mode === "arrange" ? (
          <div
            {...listeners}
            {...attributes}
            className="shrink-0 cursor-grab pt-1 text-[var(--shell-muted)] hover:text-[var(--shell-ink)]"
          >
            <GripVertical className="h-3 w-3" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div
            className="w-full select-none truncate text-left text-[var(--shell-ink)]"
            title={exercise.name}
          >
            {exercise.name}
          </div>
          <div className="mt-0.5 truncate text-[10px] uppercase tracking-[0.08em] text-[var(--shell-muted)]">
            {summary ?? "No set plan"}
          </div>
        </div>
        {mode === "arrange" ? (
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
        ) : null}
      </div>
    </div>
  );
}
