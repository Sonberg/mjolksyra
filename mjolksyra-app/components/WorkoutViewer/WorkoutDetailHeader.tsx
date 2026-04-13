"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, MessageSquareIcon, PencilIcon, CheckIcon, RefreshCcwIcon, CircleIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

type Props = {
  displayName: string;
  isCompleted: boolean;
  createdAt?: Date | string | null;
  completedAt?: Date | string | null;
  plannedWorkoutId?: string | null;
  viewerMode: "athlete" | "coach";
  isEditMode: boolean;
  onToggleEditMode: () => void;
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
  isEditMode,
  onToggleEditMode,
  onRestoreToPlanned,
  isRestoring,
  onToggleCompletion,
  isSavingCompletion,
  onOpenChat,
}: Props) {
  return (
    <div className="flex-none border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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

          <div className="flex shrink-0 sm:justify-end">
            <StatusBadge variant={isCompleted ? "accent" : "default"} className="w-full justify-center sm:w-auto">
              <CheckCircle2Icon className="h-3 w-3" />
              {isCompleted ? "Completed" : "In progress"}
            </StatusBadge>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {viewerMode === "athlete" ? (
            <>
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={onToggleEditMode}
                className="w-full justify-center sm:w-auto"
              >
                {isEditMode ? <CheckIcon /> : <PencilIcon />}
                {isEditMode ? "Done" : "Edit"}
              </Button>
              {plannedWorkoutId && !isEditMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRestoring}
                  onClick={onRestoreToPlanned}
                  className="w-full justify-center sm:w-auto"
                >
                  <RefreshCcwIcon />
                  Restore to planned
                </Button>
              ) : null}
            </>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center md:hidden sm:w-auto"
            aria-label="Open chat"
            onClick={onOpenChat}
          >
            <MessageSquareIcon />
            Chat
          </Button>

          {viewerMode === "athlete" && !isEditMode ? (
            <Button
              variant="default"
              size="sm"
              disabled={isSavingCompletion}
              onClick={onToggleCompletion}
              className="w-full justify-center sm:ml-auto sm:w-auto"
            >
              {isCompleted ? <CircleIcon /> : <CheckCircle2Icon />}
              {isCompleted ? "Mark incomplete" : "Complete workout"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
