import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { ArrowDownIcon, ArrowUpIcon, EllipsisVertical, NotebookPenIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { DraggingToolTip } from "../DraggingToolTip";
import { useWorkouts } from "./contexts/Workouts";
import { usePlannedWorkoutActions } from "./contexts/PlannedWorkoutActions";
import { monthId } from "@/lib/monthId";
import { Textarea } from "../ui/textarea";

type Props = {
  plannedExercise: PlannedExercise;
  plannedWorkout: PlannedWorkout | null;
  index: number;
  isLast: boolean;
  isGhost: boolean;
  date: dayjs.Dayjs;
};

export function DayExercise({
  plannedWorkout,
  plannedExercise,
  index,
  isLast,
  isGhost,
  date,
}: Props) {
  const [isOpen, setOpen] = useState(false);

  const workouts = useWorkouts();
  const actions = usePlannedWorkoutActions();
  const data = useMemo(
    () => ({
      date,
      index,
      plannedWorkout,
      plannedExercise,
      source: "workout",
      type: "plannedExercise",
      allowedTypes: ["plannedExercise"],
      label: plannedExercise.name,
    }),
    [date, index, plannedWorkout, plannedExercise]
  );

  const {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: plannedExercise.id,
    data,
  });

  const exerciseIndex = useMemo(
    () =>
      plannedWorkout?.exercises.findIndex((x) => x.id === plannedExercise.id) ?? -1,
    [plannedWorkout, plannedExercise.id]
  );
  const canMoveUp = exerciseIndex > 0;
  const canMoveDown =
    exerciseIndex >= 0 &&
    !!plannedWorkout &&
    exerciseIndex < plannedWorkout.exercises.length - 1;

  const syncWorkout = useCallback(
    (updatedWorkout: PlannedWorkout) => {
      actions.update({ plannedWorkout: updatedWorkout });
      workouts.dispatch({
        type: "SET_WORKOUT",
        payload: {
          plannedWorkout: updatedWorkout,
          monthId: monthId(updatedWorkout.plannedAt),
        },
      });
    },
    [actions, workouts]
  );

  const onDelete = useCallback(() => {
    if (!plannedWorkout) {
      return;
    }

    const newPlannedWorkout = {
      ...plannedWorkout,
      exercises: plannedWorkout.exercises.filter(
        (x) => x.id !== plannedExercise.id
      ),
    };

    syncWorkout(newPlannedWorkout);
  }, [syncWorkout, plannedExercise, plannedWorkout]);

  const onMoveUp = useCallback(() => {
    if (!plannedWorkout || !canMoveUp) {
      return;
    }

    const updatedWorkout = {
      ...plannedWorkout,
      exercises: arrayMove(
        plannedWorkout.exercises,
        exerciseIndex,
        exerciseIndex - 1
      ),
    };

    syncWorkout(updatedWorkout);
  }, [syncWorkout, plannedWorkout, canMoveUp, exerciseIndex]);

  const onMoveDown = useCallback(() => {
    if (!plannedWorkout || !canMoveDown) {
      return;
    }

    const updatedWorkout = {
      ...plannedWorkout,
      exercises: arrayMove(
        plannedWorkout.exercises,
        exerciseIndex,
        exerciseIndex + 1
      ),
    };

    syncWorkout(updatedWorkout);
  }, [syncWorkout, plannedWorkout, canMoveDown, exerciseIndex]);

  const onUpdateNote = useCallback(
    (value: string) => {
      if (!plannedWorkout) {
        return;
      }

      const updatedWorkout = {
        ...plannedWorkout,
        exercises: plannedWorkout.exercises.map((x) =>
          x.id === plannedExercise.id
            ? {
                ...x,
                note: value || null,
              }
            : x
        ),
      };

      syncWorkout(updatedWorkout);
    },
    [syncWorkout, plannedWorkout, plannedExercise.id]
  );

  return useMemo(
    () => (
      <>
        <div
          className={cn({
            "opacity-40": isDragging || isGhost,
            "bg-zinc-900/50": isDragging || isGhost,
            "bg-cyan-300/10": isOpen,
            "group rounded-lg border border-white/10 bg-zinc-900/70 px-2 py-1.5 text-xs transition hover:border-cyan-200/20 hover:bg-zinc-900":
              true,
            "mb-1.5": !isLast,
          })}
          ref={setNodeRef}
          style={{ transform: CSS.Translate.toString(transform), transition }}
          {...attributes}
          role="row"
        >
          <div
            className="grid w-full grid-cols-[auto_1fr_auto] items-center justify-between gap-1 text-sm"
          >
            <DraggingToolTip
              listeners={listeners}
              icon={<EllipsisVertical className="h-4 text-zinc-500" />}
              onDelete={onDelete}
            />
            <button
              type="button"
              className="select-none overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm text-zinc-200"
              onClick={() => setOpen((open) => !open)}
              title={plannedExercise.name}
            >
              {plannedExercise.name}
            </button>
            <button
              type="button"
              className={cn(
                "grid h-6 w-6 place-content-center rounded-md text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200",
                { "text-cyan-200": !!plannedExercise.note }
              )}
              onClick={() => setOpen((open) => !open)}
              title="Edit notes and reorder"
            >
              <NotebookPenIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {isOpen ? (
            <div className="mt-2 space-y-2 border-t border-white/10 pt-2">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={onMoveUp}
                  disabled={!canMoveUp}
                  className="grid h-6 w-6 place-content-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Move up"
                >
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onMoveDown}
                  disabled={!canMoveDown}
                  className="grid h-6 w-6 place-content-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Move down"
                >
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <Textarea
                value={plannedExercise.note ?? ""}
                onChange={(ev) => onUpdateNote(ev.target.value)}
                placeholder="Add note for this exercise..."
                className="min-h-16 border-white/15 bg-zinc-900/90 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          ) : null}
        </div>
      </>
    ),
    [
      plannedExercise,
      transform,
      transition,
      setNodeRef,
      onDelete,
      attributes,
      listeners,
      onMoveDown,
      onMoveUp,
      onUpdateNote,
      canMoveDown,
      canMoveUp,
      isDragging,
      isGhost,
      isLast,
      isOpen,
    ]
  );
}
