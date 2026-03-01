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
  const isFutureWeek = useMemo(
    () => date.startOf("week").isAfter(dayjs().startOf("week")),
    [date]
  );
  const isCompleted = !!plannedWorkout?.completedAt;
  const isLocked = isCompleted || !isFutureWeek;
  const canPlan = !isLocked;

  const data = useMemo(
    () => ({
      date,
      plannedWorkout,
      type: "plannedWorkout",
      allowedTypes: canPlan
        ? ["plannedExercise", "plannedWorkout", "exercise"]
        : [],
      label: date.format("dddd, D MMM YYYY"),
      canPlan,
      isLocked,
    }),
    [date, plannedWorkout, canPlan, isLocked]
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
    disabled: isLocked,
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
        <div className="flex min-h-32 min-w-0 flex-col p-2">
          <div
            className="flex h-9 min-w-0 items-center justify-between rounded-lg border border-white/10 bg-zinc-900/70 px-1.5 text-xs font-bold"
            ref={setDraggableNodeRef}
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <div className="select-none text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
                {date.format("dd")}
              </div>
              <div
                className={cn({
                  "select-none rounded-full px-1.5 py-0.5 text-zinc-300": true,
                  "bg-red-800 text-white": isToday,
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
                      icon={
                        <div className="grid h-6 w-6 place-content-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200">
                          <RectangleEllipsisIcon className="h-3.5 w-3.5" />
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
                        "grid h-6 w-6 place-content-center rounded-md text-zinc-300 transition": true,
                        "bg-emerald-600 text-white":
                          editor.plannedWorkoutId === plannedWorkout.id,
                        "hover:bg-emerald-600/40":
                          editor.plannedWorkoutId !== plannedWorkout.id,
                        "hover:bg-emerald-500":
                          editor.plannedWorkoutId === plannedWorkout.id,
                      })}
                      onClick={() =>
                        editor.plannedWorkoutId === plannedWorkout.id
                          ? editor.close()
                          : editor.open(plannedWorkout.id)
                      }
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </div>
                  </>
                ) : (
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                      isCompleted
                        ? plannedWorkout?.reviewedAt
                          ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-200"
                          : "border-amber-700/60 bg-amber-900/20 text-amber-200"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400"
                    )}
                    title={
                      isCompleted
                        ? "Completed days are locked from planning changes."
                        : "Planning is available for future weeks only."
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
          <div
            ref={setDroppableNodeRef}
            className={cn({
              "relative mt-2 flex h-full min-h-24 flex-1 flex-col rounded-lg border border-transparent": true,
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
                    locked={isLocked}
                  />
                ))}
              </SortableContext>
            ) : (
              <div className="grid min-h-32 place-items-center rounded-lg border border-dashed border-white/10 px-4 text-center text-sm text-zinc-500 opacity-0 transition-all hover:opacity-100">
                <div className="select-none">
                  {canPlan
                    ? "Drag & drop exercises to start planning"
                    : "Planning is available for future weeks only"}
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
      isCompleted,
      isLocked,
      canPlan,
      isOverContainer,
      canDrop,
      listeners,
      setDraggableNodeRef,
      setDroppableNodeRef,
    ]
  );
}
