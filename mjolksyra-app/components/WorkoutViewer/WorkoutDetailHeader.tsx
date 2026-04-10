"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, MessageSquareIcon, PlusIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

type Props = {
  displayName: string;
  isCompleted: boolean;
  createdAt?: Date | string | null;
  completedAt?: Date | string | null;
  plannedWorkoutId?: string | null;
  viewerMode: "athlete" | "coach";
  onAddExercise: () => void;
  onRestoreToPlanned: () => void;
  isRestoring?: boolean;
  onToggleCompletion: () => void;
  isSavingCompletion?: boolean;
  onOpenChat: () => void;
};

export function WorkoutDetailHeader({
  displayName,
  isCompleted,
  createdAt,
  completedAt,
  plannedWorkoutId,
  viewerMode,
  onAddExercise,
  onRestoreToPlanned,
  isRestoring,
  onToggleCompletion,
  isSavingCompletion,
  onOpenChat,
}: Props) {
  return (
    <div className="flex-none border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-[var(--shell-ink)]">
            {displayName}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            {completedAt ? (
              <span className="text-[11px] text-[var(--shell-muted)]">
                Completed {new Date(completedAt).toLocaleString()}
              </span>
            ) : (
              <span className="text-[11px] text-[var(--shell-muted)]">
                Session started {new Date(createdAt ?? new Date()).toLocaleString()}
              </span>
            )}
            <span aria-hidden="true" className="text-[11px] text-[var(--shell-border)]">
              ·
            </span>
            <span className="text-[11px] text-[var(--shell-muted)]">
              {plannedWorkoutId ? "Linked to planned workout" : "Ad hoc session"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusBadge variant={isCompleted ? "accent" : "default"}>
            <CheckCircle2Icon className="h-3 w-3" />
            {isCompleted ? "Completed" : "In progress"}
          </StatusBadge>

          {viewerMode === "athlete" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddExercise}
              >
                <PlusIcon />
                Add exercise
              </Button>
              {plannedWorkoutId ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRestoring}
                  onClick={onRestoreToPlanned}
                >
                  Restore to planned
                </Button>
              ) : null}
              <Button
                variant="default"
                size="sm"
                disabled={isSavingCompletion}
                onClick={onToggleCompletion}
              >
                {isCompleted ? "Mark incomplete" : "Complete workout"}
              </Button>
            </>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            aria-label="Open chat"
            onClick={onOpenChat}
          >
            <MessageSquareIcon />
            Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
