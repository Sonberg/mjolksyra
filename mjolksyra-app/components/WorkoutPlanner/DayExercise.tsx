import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { EllipsisVertical } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { DraggingToolTip } from "../DraggingToolTip";
import { useWorkouts } from "./contexts/Workouts";
import { usePlannedWorkoutActions } from "./contexts/PlannedWorkoutActions";
import { monthId } from "@/lib/monthId";

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

    actions.update({ plannedWorkout: newPlannedWorkout });
    workouts.dispatch({
      type: "SET_WORKOUT",
      payload: {
        plannedWorkout: newPlannedWorkout,
        monthId: monthId(plannedWorkout.plannedAt),
      },
    });
  }, [actions, workouts, plannedExercise, plannedWorkout]);

  return useMemo(
    () => (
      <>
        <div
          className={cn({
            "opacity-40": isDragging || isGhost,
            "bg-zinc-900/50": isDragging || isGhost,
            "bg-cyan-300/10": isOpen,
            "group flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/70 px-2 py-1.5 text-xs transition hover:border-cyan-200/20 hover:bg-zinc-900":
              true,
            "mb-1.5": !isLast,
          })}
          ref={setNodeRef}
          style={{ transform: CSS.Translate.toString(transform), transition }}
          {...attributes}
          role="row"
        >
          <div
            onClick={() => setOpen((open) => !open)}
            className="grid w-full grid-cols-[auto_1fr_auto] items-center justify-between gap-1 text-sm"
          >
            <DraggingToolTip
              listeners={listeners}
              icon={<EllipsisVertical className="h-4 text-zinc-500" />}
              onDelete={onDelete}
            />
            <div className="select-none overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm text-zinc-200">
              {plannedExercise.name}
            </div>
          </div>
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
      isDragging,
      isGhost,
      isLast,
      isOpen,
    ]
  );
}
