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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
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
        className={cn({ "mb-1.5": !isLast })}
        role="row"
      >
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ExerciseCard
                  name={plannedExercise.name}
                  prescription={plannedExercise.prescription ?? null}
                  isDragging={isDragging}
                  isGhost={isGhost}
                  leftSlot={
                    !locked ? (
                      <DraggingToolTip
                        listeners={listeners}
                        icon={
                          <EllipsisVertical className="h-4 text-[var(--shell-muted)]" />
                        }
                        onDelete={onDelete}
                      />
                    ) : null
                  }
                  rightSlot={
                    !plannedExercise.isPublished ? (
                      <span
                        className="h-1.5 w-1.5 shrink-0 self-center rounded-none bg-[var(--shell-accent)]"
                        title="Draft change"
                      />
                    ) : null
                  }
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-80 break-words">
              {plannedExercise.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
