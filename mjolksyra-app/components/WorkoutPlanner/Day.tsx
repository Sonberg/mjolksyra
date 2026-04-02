import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";

import { DayExercise } from "./DayExercise";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  PlannedExercise,
  PlannedWorkout,
} from "@/services/plannedWorkouts/type";
import { draggingStyle } from "@/lib/draggingStyle";
import { PLANNED_AT } from "@/constants/dateFormats";
import { useCloning } from "./contexts/Planner";
import { insertAt } from "@/lib/insertAt";
import { useWorkoutEditor } from "./contexts/WorkoutEditor";
import { usePlannedWorkoutActions } from "./contexts/PlannedWorkoutActions";
import { useWorkouts } from "./contexts/Workouts";
import { monthId } from "@/lib/monthId";
import { ExerciseQuickSearchOverlay } from "../ExerciseLibrary/ExerciseQuickSearchOverlay";
import type { Exercise as LibraryExercise } from "@/services/exercises/type";
import { inferPrescriptionFromType, ExerciseType } from "@/lib/exercisePrescription";
import { v4 } from "uuid";
import { DayHeader } from "./DayHeader";
import type { SearchExercises } from "@/services/exercises/searchExercises";

const DATE_FORMAT = "YYYY-MM-DD";

type Exercise = PlannedExercise & {
  isGhost?: boolean;
};

type Props = {
  date: dayjs.Dayjs;
  plannedWorkout: PlannedWorkout | null;
  searchExercisesFn?: SearchExercises;
};

export function Day({ date, plannedWorkout, searchExercisesFn }: Props) {
  const cloning = useCloning();
  const editor = useWorkoutEditor();
  const workouts = useWorkouts();
  const actions = usePlannedWorkoutActions();
  const id = useMemo(() => date.format(PLANNED_AT), [date]);
  const isPastDay = useMemo(
    () => date.startOf("day").isBefore(dayjs().startOf("day")),
    [date],
  );
  const isCompleted = !!plannedWorkout?.completedAt;
  const isPast = isPastDay || isCompleted;
  const isLocked = isPast;
  const canPlan = !isPast;
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

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
    [date, plannedWorkout, canPlan, isLocked],
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
    [exercises, over?.id, active?.id, isOver],
  );

  const addExerciseFromOverlay = useCallback(
    async (exercise: LibraryExercise) => {
      const newExercise: PlannedExercise = {
        id: v4(),
        exerciseId: exercise.id,
        name: exercise.name,
        note: "",
        isPublished: false,
        isDone: false,
        prescription: inferPrescriptionFromType(exercise.type as ExerciseType | null | undefined),
      };

      if (plannedWorkout) {
        const updatedWorkout: PlannedWorkout = {
          ...plannedWorkout,
          exercises: [...plannedWorkout.exercises, newExercise],
        };

        await actions.update({ plannedWorkout: updatedWorkout });
        workouts.dispatch({
          type: "SET_WORKOUT",
          payload: {
            monthId: monthId(plannedWorkout.plannedAt),
            plannedWorkout: updatedWorkout,
          },
        });
        return;
      }

      const newWorkout: PlannedWorkout = {
        id: v4(),
        traineeId: workouts.traineeId,
        name: null,
        note: null,
        media: [],
        plannedAt: date.format(PLANNED_AT),
        completedAt: null,
        reviewedAt: null,
        exercises: [newExercise],
        createdAt: null,
        appliedBlock: null,
      };

      await actions.create({ plannedWorkout: newWorkout });
      workouts.dispatch({
        type: "SET_MONTH",
        payload: {
          monthId: monthId(date),
          workouts: [...(workouts.data[monthId(date)] ?? []), newWorkout],
        },
      });
    },
    [plannedWorkout, workouts, date, actions],
  );

  const onDeleteWorkout = useCallback(() => {
    if (!plannedWorkout) {
      return;
    }

    actions.delete({ plannedWorkout });
    workouts.dispatch({
      type: "DELETE_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkoutId: plannedWorkout.id,
      },
    });
  }, [actions, plannedWorkout, workouts]);

  const onToggleEditor = useCallback(() => {
    if (!plannedWorkout) {
      return;
    }

    if (editor.plannedWorkoutId === plannedWorkout.id) {
      editor.close();
      return;
    }

    editor.open(plannedWorkout.id);
  }, [editor, plannedWorkout]);

  return useMemo(
    () => (
      <>
        <div className="flex min-h-32 min-w-0 flex-col">
          <DayHeader
            date={date}
            isToday={isToday}
            plannedWorkout={plannedWorkout}
            canPlan={canPlan}
            isCompleted={isCompleted}
            isActiveEditor={editor.plannedWorkoutId === plannedWorkout?.id}
            listeners={listeners}
            setDraggableNodeRef={setDraggableNodeRef}
            onDeleteWorkout={onDeleteWorkout}
            onToggleEditor={onToggleEditor}
          />
          <div
            ref={setDroppableNodeRef}
            className={cn({
              "relative flex h-full min-h-24 flex-1 flex-col rounded-none border border-transparent p-2": true,
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
                    isLast={index === exercises.length - 1}
                    date={date}
                    plannedExercise={x}
                    plannedWorkout={plannedWorkout}
                    isGhost={x.isGhost ?? false}
                    locked={isLocked}
                  />
                ))}
              </SortableContext>
            ) : (
              <div
                onClick={() => (canPlan ? setIsQuickSearchOpen(true) : null)}
                className={cn(
                  "grid  h-full min-h-32 place-items-center rounded-none px-4 text-center text-sm text-[var(--shell-muted)] transition-all ",
                  canPlan
                    ? "border cursor-pointer border-dashed border-[var(--shell-border)] opacity-60 hover:opacity-100 hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)] hover:border-[var(--shell-ink)]"
                    : "opacity-30",
                )}
              >
                <div className="select-none">
                  {canPlan
                    ? "Click or drag to add exercises"
                    : "Planning is available for today and future days"}
                </div>
              </div>
            )}
            {canPlan && exercises.length ? (
              <button
                type="button"
                onClick={() => setIsQuickSearchOpen(true)}
                className="mt-2 inline-flex h-8 items-center justify-between rounded-none  bg-[var(--shell-surface)] px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)] border border-[var(--shell-surface-strong)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
              >
                <span>Add exercise</span>
              </button>
            ) : null}
          </div>
        </div>
        <ExerciseQuickSearchOverlay
          open={isQuickSearchOpen}
          onOpenChange={setIsQuickSearchOpen}
          onSelectExercise={addExerciseFromOverlay}
          title={`Add exercise · ${date.format("ddd D MMM")}`}
          searchExercisesFn={searchExercisesFn}
        />
      </>
    ),
    [
      date,
      editor,
      exercises,
      addExerciseFromOverlay,
      plannedWorkout,
      isToday,
      isCompleted,
      isLocked,
      canPlan,
      isQuickSearchOpen,
      isOverContainer,
      canDrop,
      listeners,
      onDeleteWorkout,
      onToggleEditor,
      setDraggableNodeRef,
      setDroppableNodeRef,
      searchExercisesFn,
    ],
  );
}
