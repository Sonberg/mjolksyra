"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { parse, Payload } from "./parse";
import { transform } from "./transformers";
import { deletePlannedWorkout } from "@/api/plannedWorkouts/deletePlannedWorkout";
import { createPlannedWorkout } from "@/api/plannedWorkouts/createPlannedWorkout";
import { updatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";
import { uniqBy } from "@/lib/uniqBy";
import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { useWorkouts } from "../Workouts";
import { PLANNED_AT } from "@/constants/dateFormats";
import { createPortal } from "react-dom";
import { DraggingExercise } from "@/components/DraggingExercise";
import { v4 } from "uuid";
import dayjs from "dayjs";
import { insertAt } from "@/lib/insertAt";

type Args = {
  traineeId: string;
  children: ReactNode;
};

type Clone = {
  targetMonth: string;
  targetDate: string;
  targetWorkout?: PlannedWorkout;
  exercise: PlannedExercise;
  index: number;
};

type Event = DragStartEvent | DragOverEvent | DragEndEvent;

const CloningContext = createContext<Clone | null>(null);

function isCloning(event: Event) {
  const activeData = event.active?.data.current as Payload | undefined;
  const eventTarget = event.activatorEvent.target as HTMLElement;

  return (
    eventTarget?.getAttribute("data-action") === "clone" ||
    activeData?.type === "exercise"
  );
}

function isDraggingWorkout(event: Event) {
  return (
    (event.active.data.current as Payload | undefined)?.type ===
    "plannedWorkout"
  );
}

function isDraggingExercise(event: Event) {
  return (
    (event.active.data.current as Payload | undefined)?.type ===
    "plannedExercise"
  );
}

function isDraggingWeek(event: Event) {
  return (event.active.data.current as Payload | undefined)?.type === "week";
}

function getExercise(event: Event, clone: boolean) {
  const activeData = event.active?.data.current as Payload | undefined;

  if (activeData?.type == "plannedExercise") {
    return activeData.plannedExercise
      ? {
          ...activeData.plannedExercise,
          id: clone ? v4() : activeData.plannedExercise.id,
        }
      : null;
  }

  if (activeData?.type == "exercise") {
    return {
      id: v4(),
      name: activeData.exercise.name,
      exerciseId: activeData.exercise.id,
    } as PlannedExercise;
  }

  return null;
}

export const useCloning = () => useContext(CloningContext);

export function PlannerProvider({ traineeId, children }: Args) {
  const { dispatch, reload } = useWorkouts();

  const [dragging, setDragging] = useState<string | null>(null);
  const [cloning, setCloning] = useState<Clone | null>(null);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setDragging(null);
      setCloning(null);

      if (cloning) {
        if (cloning.targetWorkout) {
          await updatePlannedWorkout({
            plannedWorkout: {
              ...cloning.targetWorkout,
              exercises: insertAt(
                cloning.targetWorkout.exercises,
                cloning.index,
                cloning.exercise
              ),
            },
          });
        } else {
          await createPlannedWorkout({
            plannedWorkout: {
              id: v4(),
              traineeId,
              name: null,
              note: null,
              exercises: [cloning.exercise],
              plannedAt: cloning.targetDate,
              createdAt: null,
            },
          });
        }

        await reload(cloning.targetMonth);

        return;
      }

      const action = parse(event);
      const result = transform(traineeId, action);

      // const overData = event.over?.data.current as Payload | undefined;
      // const activeData = event.active?.data.current as Payload | undefined;

      // const source =
      //   activeData?.type === "plannedExercise" ||
      //   activeData?.type === "plannedWorkout"
      //     ? activeData
      //     : null;

      // const target =
      //   overData?.type === "plannedExercise" ||
      //   overData?.type === "plannedWorkout"
      //     ? overData
      //     : null;

      // if (!target) {
      //   return;
      // }

      // if (isDraggingWorkout(event)) {
      //   console.log("droppend workout", event.over?.data.current, clone);
      //   if (!source?.plannedWorkout) {
      //     return;
      //   }

      //   if (!clone) {
      //     console.log("delete");

      //     await deletePlannedWorkout({
      //       plannedWorkout: source.plannedWorkout!,
      //     });
      //   }

      //   if (target.plannedWorkout) {
      //     await updatePlannedWorkout({
      //       plannedWorkout: {
      //         ...source.plannedWorkout,
      //         id: target.plannedWorkout!.id,
      //         plannedAt: target.date.format(PLANNED_AT),
      //       },
      //     });
      //   } else {
      //     await createPlannedWorkout({
      //       plannedWorkout: {
      //         ...source.plannedWorkout,
      //         id: v4(),
      //         plannedAt: target.date.format(PLANNED_AT),
      //       },
      //     });
      //   }
      // }

      // const workouts = [source?.plannedWorkout, target?.plannedWorkout];
      // const dates = uniqBy(
      //   workouts.map((x) => x?.plannedAt).filter((x): x is string => !!x),
      //   (x) => `${x}`.substring(0, 7)
      // );

      // if (isDraggingExercise(event)) {
      //   for (const workout of workouts) {
      //     if (!workout) {
      //       continue;
      //     }

      //     if (workout.createdAt) {
      //       await updatePlannedWorkout({
      //         plannedWorkout: workout,
      //       });
      //     } else {
      //       await createPlannedWorkout({
      //         plannedWorkout: workout,
      //       });
      //     }
      //   }
      // }

      // const tasks = dates
      //   .map((x) => x.split("-"))
      //   .map(([year, month]) => reload(`${year}-${Number(month) - 1}`));

      // await Promise.all(tasks);

      await Promise.all(
        result.delete.map((plannedWorkout) =>
          deletePlannedWorkout({ plannedWorkout })
        )
      );

      await Promise.all(
        result.update.map((plannedWorkout) =>
          updatePlannedWorkout({ plannedWorkout })
        )
      );

      await Promise.all(
        result.create.map((plannedWorkout) =>
          createPlannedWorkout({ plannedWorkout })
        )
      );

      const updated = [...result.delete, ...result.create, ...result.update];
      const tasks = updated
        .map((x) => x.plannedAt.split("-"))
        .map(([year, month]) => reload(`${year}-${Number(month) - 1}`));

      await Promise.all(tasks);
    },
    [cloning]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const overData = event.over?.data.current as Payload | undefined;
      const activeData = event.active?.data.current as Payload | undefined;
      const clone = isCloning(event);

      const source =
        activeData?.type === "plannedExercise" ||
        activeData?.type === "plannedWorkout"
          ? activeData
          : null;

      const target =
        overData?.type === "plannedExercise" ||
        overData?.type === "plannedWorkout"
          ? overData
          : null;

      if (!target) {
        return;
      }

      if (isDraggingWeek(event)) {
        return;
      }

      if (isDraggingWorkout(event)) {
        return;
      }

      const exercise = getExercise(event, clone);
      const index = overData?.type == "plannedExercise" ? overData.index : -1;
      const sourceMonthId = `${source?.date.year()}-${source?.date.month()}`;
      const sourceDate = source?.date.format(PLANNED_AT);
      const targetMonthId = `${target?.date.year()}-${target?.date.month()}`;
      const targetDate = target?.date.format(PLANNED_AT);

      if (clone && exercise) {
        const checkes = [
          targetDate === cloning?.targetDate,
          exercise.exerciseId === cloning?.exercise.exerciseId,
          index === cloning?.index,
        ];

        if (checkes.every((x) => x)) {
          return;
        }

        setCloning({
          targetMonth: targetMonthId,
          targetWorkout: target.plannedWorkout,
          targetDate,
          exercise,
          index,
        });
        return;
      }

      if (targetDate === sourceDate) {
        dispatch({
          type: "MOVE_EXERCISE",
          payload: {
            monthId: targetMonthId,
            plannedWorkoutId: target!.plannedWorkout!.id,
            plannedExerciseId: exercise!.id,
            index: index ?? -1,
          },
        });
        return;
      }

      if (targetDate !== sourceDate) {
        if (!clone) {
          dispatch({
            type: "REMOVE_EXERCISE",
            payload: {
              monthId: sourceMonthId,
              plannedWorkoutId: source!.plannedWorkout!.id,
              plannedExerciseId: exercise!.id,
            },
          });
        }

        dispatch({
          type: "ADD_EXERCISE",
          payload: {
            traineeId,
            targetMonthId: targetMonthId,
            targetDate: target.date,
            exercise: exercise!,
            index: index,
          },
        });
        return;
      }
    },
    [traineeId, cloning, dispatch]
  );

  return (
    <>
      <CloningContext.Provider value={cloning}>
        <DndContext
          collisionDetection={pointerWithin}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragCancel={() => {
            setDragging(null);
            setCloning(null);
          }}
          onDragAbort={() => {
            setDragging(null);
            setCloning(null);
          }}
          onDragStart={(event) => {
            setDragging(event.active.data.current?.label ?? null);
          }}
        >
          {children}
          {dragging
            ? createPortal(
                <DragOverlay>
                  <DraggingExercise name={dragging} />
                </DragOverlay>,
                document.body
              )
            : null}
        </DndContext>
      </CloningContext.Provider>
    </>
  );
}
