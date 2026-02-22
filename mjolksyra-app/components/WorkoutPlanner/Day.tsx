import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

import { DayExercise } from "./DayExercise";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { PencilIcon, RectangleEllipsisIcon } from "lucide-react";
import { DraggingToolTip } from "../DraggingToolTip";
import { draggingStyle } from "@/lib/draggingStyle";
import { PLANNED_AT } from "@/constants/dateFormats";
import { useCloning } from "./contexts/Planner";
import { insertAt } from "@/lib/insertAt";
import { useWorkoutEditor } from "./contexts/WorkoutEditor";
import { usePlannedWorkoutActions } from "./contexts/PlannedWorkoutActions";
import { useWorkouts } from "./contexts/Workouts";
import { monthId } from "@/lib/monthId";

const DATE_FORMAT = "YYYY-MM-DD";

type Exercise = PlannedExercise & {
  isGhost?: boolean;
};

type Props = {
  date: dayjs.Dayjs;
  plannedWorkout: PlannedWorkout | null;
};

export function Day({ date, plannedWorkout }: Props) {
  const cloning = useCloning();
  const editor = useWorkoutEditor();
  const workouts = useWorkouts();
  const actions = usePlannedWorkoutActions();
  const id = useMemo(() => date.format(PLANNED_AT), [date]);
  const data = useMemo(
    () => ({
      date,
      plannedWorkout,
      type: "plannedWorkout",
      allowedTypes: ["plannedExercise", "plannedWorkout", "exercise"],
      label: date.format("dddd, D MMM YYYY"),
    }),
    [date, plannedWorkout]
  );

  const {
    over,
    isOver,
    active,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
  } = useSortable({
    id,
    data,
  });

  const canDrop = data.allowedTypes.includes(active?.data.current?.type);

  const isToday = useMemo(() => {
    return dayjs().format(DATE_FORMAT) === date?.format(DATE_FORMAT);
  }, [date]);

  const exercises = useMemo<Exercise[]>(() => {
    const data = plannedWorkout?.exercises ?? [];

    if (!cloning) {
      return data;
    }

    if (cloning.targetDate !== date.format(PLANNED_AT)) {
      return data;
    }

    if (!data.length) {
      return [
        {
          ...cloning.exercise,
          isGhost: true,
        },
      ];
    }

    return insertAt<Exercise>(data, cloning.index, {
      ...cloning.exercise,
      isGhost: true,
    });
  }, [cloning, date, plannedWorkout?.exercises]);

  const isOverContainer = useMemo(
    () =>
      isOver || exercises.some((x) => x.id === over?.id || x.id === active?.id),
    [exercises, over?.id, active?.id, isOver]
  );

  return useMemo(
    () => (
      <>
        <div className="flex flex-col">
          <div
            className="font-bold text-xs h-9 border-b flex items-center justify-between"
            ref={setDraggableNodeRef}
          >
            <div
              className={cn({
                "py-1 px-2 rounded-full select-none": true,
                "bg-red-800 text-white": isToday,
              })}
            >
              {date.date()}
            </div>
            {plannedWorkout ? (
              <div className="flex items-center cursor-pointer">
                <DraggingToolTip
                  icon={
                    <div className="hover:bg-accent grid place-content-center px-2 h-9">
                      <RectangleEllipsisIcon className="h-4" />
                    </div>
                  }
                  listeners={listeners}
                  onDelete={() => {
                    actions.delete({ plannedWorkout });
                    workouts.dispatch({
                      type: "DELETE_WORKOUT",
                      payload: {
                        monthId: monthId(plannedWorkout.plannedAt),
                        plannedWorkoutId: plannedWorkout.id,
                      },
                    });
                  }}
                />
                <div
                  className={cn({
                    "grid place-content-center px-2 h-9 ": true,

                    "bg-green-600":
                      editor.plannedWorkoutId === plannedWorkout.id,
                    "hover:bg-green-600/40":
                      editor.plannedWorkoutId !== plannedWorkout.id,
                    "hover:bg-green-500":
                      editor.plannedWorkoutId === plannedWorkout.id,
                  })}
                  onClick={() =>
                    editor.plannedWorkoutId === plannedWorkout.id
                      ? editor.close()
                      : editor.open(plannedWorkout.id)
                  }
                >
                  <PencilIcon className="h-4 " />
                </div>
              </div>
            ) : null}
          </div>
          <div
            ref={setDroppableNodeRef}
            className={cn({
              "flex flex-1 h-full min-h-24 flex-col": true,
              ...draggingStyle({ canDrop, isOver: isOverContainer }),
            })}
          >
            {exercises.length ? (
              <SortableContext
                strategy={verticalListSortingStrategy}
                items={plannedWorkout?.exercises.map((x) => x.id) ?? []}
              >
                {exercises.map((x, index) => (
                  <DayExercise
                    key={x.id}
                    index={index}
                    date={date}
                    plannedExercise={x}
                    plannedWorkout={plannedWorkout}
                    isLast={index === exercises.length - 1}
                    isGhost={x.isGhost ?? false}
                  />
                ))}
              </SortableContext>
            ) : (
              <div className="text-muted-foreground text-sm  place-items-center grid transition-all min-h-32 px-4 text-center opacity-0 hover:opacity-100">
                <div className="select-none">
                  Drag & drop exercises to start planning
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    ),
    [
      date,
      editor,
      exercises,
      actions,
      workouts,
      plannedWorkout,
      isToday,
      isOverContainer,
      canDrop,
      listeners,
      setDraggableNodeRef,
      setDroppableNodeRef,
    ]
  );
}
