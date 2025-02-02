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
            "border-b-0": isLast,
            "opacity-40": isDragging || isGhost,
            "bg-background": isDragging || isGhost,
            "hover:bg-accent/80": true,
            "bg-accent/40": isOpen,
          })}
          ref={setNodeRef}
          style={{ transform: CSS.Translate.toString(transform), transition }}
          {...attributes}
          role="row"
        >
          <div
            onClick={() => setOpen((open) => !open)}
            className="grid grid-cols-[auto_1fr_auto] justify-between w-full text-sm  py-2  items-center gap-1"
          >
            <DraggingToolTip
              listeners={listeners}
              icon={<EllipsisVertical className="h-4" />}
              onDelete={onDelete}
            />
            <div className="text-sm select-none text-left overflow-hidden whitespace-nowrap text-ellipsis">
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
