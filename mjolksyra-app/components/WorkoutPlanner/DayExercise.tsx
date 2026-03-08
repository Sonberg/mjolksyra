import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { EllipsisVertical } from "lucide-react";
import { useCallback, useMemo } from "react";

import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { DraggingToolTip } from "../DraggingToolTip";
import { useWorkouts } from "./contexts/Workouts";
import { usePlannedWorkoutActions } from "./contexts/PlannedWorkoutActions";
import { monthId } from "@/lib/monthId";
import { ExerciseCard } from "@/components/ExerciseCard";

type Props = {
  plannedExercise: PlannedExercise;
  plannedWorkout: PlannedWorkout | null;
  index: number;
  isLast: boolean;
  isGhost: boolean;
  date: dayjs.Dayjs;
  locked?: boolean;
};

export function DayExercise({
  plannedWorkout,
  plannedExercise,
  index,
  isLast,
  isGhost,
  date,
  locked = false,
}: Props) {
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
    [date, index, plannedWorkout, plannedExercise],
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
    disabled: locked || isGhost,
  });

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
    [actions, workouts],
  );

  const onDelete = useCallback(() => {
    if (locked) {
      return;
    }

    if (!plannedWorkout) {
      return;
    }

    const newPlannedWorkout = {
      ...plannedWorkout,
      exercises: plannedWorkout.exercises.filter(
        (x) => x.id !== plannedExercise.id,
      ),
    };

    syncWorkout(newPlannedWorkout);
  }, [locked, syncWorkout, plannedExercise, plannedWorkout]);

  return useMemo(
    () => (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        {...attributes}
        className={cn({ "mb-1": !isLast })}
        role="row"
      >
        <ExerciseCard
          name={plannedExercise.name}
          prescription={plannedExercise.prescription ?? null}
          isDragging={isDragging}
          isGhost={isGhost}
          rightSlot={
            <div className="mt-0.5 flex shrink-0 items-start gap-1">
              {!plannedExercise.isPublished ? (
                <span
                  className="mt-2 h-1.5 w-1.5 rounded-none bg-[var(--shell-accent)]"
                  title="Draft change"
                />
              ) : null}
              {!locked ? (
                <DraggingToolTip
                  listeners={listeners}
                  label={plannedExercise.name}
                  icon={
                    <div className="grid h-5 w-5 place-content-center rounded-none text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]">
                      <EllipsisVertical className="h-3.5 w-3.5" />
                    </div>
                  }
                  onDelete={onDelete}
                />
              ) : null}
            </div>
          }
        />
      </div>
    ),
    [
      plannedExercise,
      transform,
      transition,
      setNodeRef,
      onDelete,
      attributes,
      listeners,
      isDragging,
      isGhost,
      isLast,
      locked,
    ],
  );
}
