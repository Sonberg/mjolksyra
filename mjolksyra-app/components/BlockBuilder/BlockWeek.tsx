"use client";

import { BlockWorkout } from "@/services/blocks/type";
import { BlockDay } from "./BlockDay";
import { useSortable } from "@dnd-kit/sortable";
import { DraggingToolTip } from "@/components/DraggingToolTip";
import { PencilIcon, RectangleEllipsisIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  week: number;
  workouts: BlockWorkout[];
  onRemoveExercise: (
    week: number,
    dayOfWeek: number,
    exerciseId: string,
  ) => void;
  onEditExercise: (week: number, dayOfWeek: number) => void;
  onAddExercise: (week: number, dayOfWeek: number) => void;
  onRemoveWorkout: (week: number, dayOfWeek: number) => void;
  selectedWorkout: { week: number; dayOfWeek: number } | null;
};

export function BlockWeek({
  week,
  workouts,
  onRemoveExercise,
  onEditExercise,
  onAddExercise,
  onRemoveWorkout,
  selectedWorkout,
}: Props) {
  return (
    <section className="overflow-hidden rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)]">
      <div className="flex select-none items-center justify-between border-b-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1">
        <div className="text-sm font-semibold text-[var(--shell-ink)]">
          Week {week}
        </div>
      </div>
      <div className="grid grid-cols-7 divide-x divide-[var(--shell-border)] border-b-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)]">
        {DAY_NAMES.map((dayName, index) => {
          const dayOfWeek = index + 1;
          const workout = workouts.find(
            (w) => w.week === week && w.dayOfWeek === dayOfWeek,
          );
          const isActiveWorkout =
            selectedWorkout?.week === week &&
            selectedWorkout?.dayOfWeek === dayOfWeek;
          return (
            <BlockDayHeader
              key={`day-header-${dayOfWeek}`}
              dayName={dayName}
              week={week}
              dayOfWeek={dayOfWeek}
              workout={workout}
              isActiveWorkout={isActiveWorkout}
              onEditWorkout={() => onEditExercise(week, dayOfWeek)}
              onDeleteWorkout={() => onRemoveWorkout(week, dayOfWeek)}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-7 divide-x divide-[var(--shell-border)]">
        {DAY_NAMES.map((_, index) => {
          const dayOfWeek = index + 1;
          const workout = workouts.find(
            (w) => w.week === week && w.dayOfWeek === dayOfWeek,
          );
          const isActiveWorkout =
            selectedWorkout?.week === week &&
            selectedWorkout?.dayOfWeek === dayOfWeek;
          return (
            <BlockDay
              key={dayOfWeek}
              week={week}
              dayOfWeek={dayOfWeek}
              workout={workout}
              onRemoveExercise={(exerciseId) =>
                onRemoveExercise(week, dayOfWeek, exerciseId)
              }
              onAddExercise={() => onAddExercise(week, dayOfWeek)}
              isActiveWorkout={isActiveWorkout}
            />
          );
        })}
      </div>
    </section>
  );
}

type BlockDayHeaderProps = {
  dayName: string;
  week: number;
  dayOfWeek: number;
  workout: BlockWorkout | undefined;
  isActiveWorkout: boolean;
  onEditWorkout: () => void;
  onDeleteWorkout: () => void;
};

function BlockDayHeader({
  dayName,
  week,
  dayOfWeek,
  workout,
  isActiveWorkout,
  onEditWorkout,
  onDeleteWorkout,
}: BlockDayHeaderProps) {
  const { listeners, setDraggableNodeRef } = useSortable({
    id: `block-workout-${week}-${dayOfWeek}`,
    data: {
      type: "blockWorkout",
      week,
      dayOfWeek,
      workout,
      label: workout
        ? `Week ${week} · Day ${dayOfWeek} · ${workout.exercises.length} exercises`
        : `Week ${week} · Day ${dayOfWeek}`,
    },
    disabled: !workout,
  });

  return (
    <div className="flex items-center justify-between">
      <div className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)] ml-2">
        {dayName}
      </div>
      {workout ? (
        <div className="flex shrink-0 items-center">
          <DraggingToolTip
            header="Week"
            label={`Week ${week}`}
            icon={
              <div
                ref={setDraggableNodeRef}
                className="grid h-10 w-8 cursor-pointer place-content-center rounded-none text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]  hover:bg-white/40"
              >
                <RectangleEllipsisIcon className="h-4 w-4" />
              </div>
            }
            listeners={listeners}
            onDelete={onDeleteWorkout}
          />
          <button
            type="button"
            className={cn(
              "grid h-10 w-8 place-content-center rounded-none text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)] hover:bg-white/40",
              isActiveWorkout && "text-[var(--shell-ink)]",
            )}
            onClick={onEditWorkout}
            title={isActiveWorkout ? "Close editor" : "Edit workout"}
            aria-label={isActiveWorkout ? "Close editor" : "Edit workout"}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <span className="h-10 w-10" aria-hidden />
      )}
    </div>
  );
}
