import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ExercisePrescription, formatPrescription } from "@/lib/exercisePrescription";

type Props = {
  name: string;
  prescription: ExercisePrescription | null;
  isActive?: boolean;
  isDragging?: boolean;
  isGhost?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  onClick?: () => void;
};

export function ExerciseCard({
  name,
  prescription,
  isActive,
  isDragging,
  isGhost,
  leftSlot,
  rightSlot,
  onClick,
}: Props) {
  const summary = formatPrescription(prescription);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1.5 text-xs transition",
        isActive && "border-[var(--shell-accent)]",
        !isActive && "hover:bg-[var(--shell-surface-strong)]",
        (isDragging || isGhost) && "opacity-40",
        onClick && "cursor-pointer",
      )}
    >
      <div className="flex items-start gap-1">
        {leftSlot}
        <div className="min-w-0 flex-1">
          <div
            className="w-full select-none truncate text-left text-[var(--shell-ink)]"
            title={name}
          >
            {name}
          </div>
          <div className="mt-0.5 truncate text-[10px] uppercase tracking-[0.08em] text-[var(--shell-muted)]">
            {summary ?? "No set plan"}
          </div>
        </div>
        {rightSlot}
      </div>
    </div>
  );
}
