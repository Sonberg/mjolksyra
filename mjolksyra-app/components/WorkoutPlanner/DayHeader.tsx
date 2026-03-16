import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { PencilIcon, RectangleEllipsisIcon } from "lucide-react";
import { DraggingToolTip } from "../DraggingToolTip";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

type Props = {
  date: dayjs.Dayjs;
  isToday: boolean;
  plannedWorkout: PlannedWorkout | null;
  canPlan: boolean;
  isCompleted: boolean;
  isActiveEditor: boolean;
  listeners: SyntheticListenerMap | undefined;
  setDraggableNodeRef: (element: HTMLElement | null) => void;
  onDeleteWorkout: () => void;
  onToggleEditor: () => void;
};

export function DayHeader({
  date,
  isToday,
  plannedWorkout,
  canPlan,
  isCompleted,
  isActiveEditor,
  listeners,
  setDraggableNodeRef,
  onDeleteWorkout,
  onToggleEditor,
}: Props) {
  return (
    <div
      className="flex min-w-0 items-center justify-between gap-1 border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1 h-10"
      ref={setDraggableNodeRef}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="select-none text-xs font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
          {date.format("ddd")}
        </div>
        <div
          className={cn({
            "select-none rounded-none border border-transparent px-1.5 py-0.5 text-[10px] font-semibold text-[var(--shell-muted)]": true,
            "bg-[var(--shell-accent)] text-[var(--shell-accent-ink)]": isToday,
          })}
        >
          {date.date()}
        </div>
      </div>
      {plannedWorkout ? (
        <div className="flex shrink-0 items-center gap-1">
          {canPlan ? (
            <>
              <DraggingToolTip
                header="Day"
                label={date.format("dddd, D MMM")}
                icon={
                  <div className="grid h-6 w-6 place-content-center rounded-none text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)]">
                    <RectangleEllipsisIcon className="h-3.5 w-3.5" />
                  </div>
                }
                listeners={listeners}
                onDelete={onDeleteWorkout}
              />
              <div
                className={cn({
                  "grid h-6 w-6 place-content-center rounded-none text-[var(--shell-muted)] transition": true,
                  "bg-[var(--shell-ink)] text-[var(--shell-surface)]":
                    isActiveEditor,
                  "hover:bg-[var(--shell-border)] hover:text-[var(--shell-ink)]":
                    !isActiveEditor,
                  "hover:text-[var(--shell-surface)]": isActiveEditor,
                })}
                onClick={onToggleEditor}
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </div>
            </>
          ) : (
            <span
              className={cn(
                "rounded-none border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                isCompleted
                  ? plannedWorkout?.reviewedAt
                    ? "border-[var(--shell-border)] bg-[var(--shell-ink)] text-[var(--shell-surface)]"
                    : "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]"
                  : "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)]",
              )}
              title={
                isCompleted
                  ? "Completed days are locked from planning changes."
                  : "Planning is available for today and future days."
              }
            >
              {isCompleted
                ? plannedWorkout?.reviewedAt
                  ? "Reviewed"
                  : "Done"
                : "Past"}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
