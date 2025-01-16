"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useCallback, useState } from "react";
import { parse, Payload } from "./parse";
import { transform } from "./transformers";
import { deletePlannedWorkout } from "@/api/plannedWorkouts/deletePlannedWorkout";
import { createPlannedWorkout } from "@/api/plannedWorkouts/createPlannedWorkout";
import { updatePlannedWorkout } from "@/api/plannedWorkouts/updatePlannedWorkout";
import { uniqBy } from "@/lib/uniqBy";
import { PlannedExercise } from "@/api/plannedWorkouts/type";
import { useWorkouts } from "../Workouts";
import { PLANNED_AT } from "@/constants/dateFormats";
import { createPortal } from "react-dom";
import { DraggingExercise } from "@/components/DraggingExercise";
import { v4 } from "uuid";

type Args = {
  traineeId: string;
  children: ReactNode;
};

const OverContext = createContext<null>(null);

export function DragDropProvider({ traineeId, children }: Args) {
  const { dispatch } = useWorkouts();

  const [dragging, setDragging] = useState<string | null>(null);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    //  const action = parse(event);
    // const result = transform(traineeId, action);

    // await Promise.all(
    //   result.delete.map((plannedWorkout) =>
    //     deletePlannedWorkout({ plannedWorkout })
    //   )
    // );

    // await Promise.all(
    //   result.update.map((plannedWorkout) =>
    //     updatePlannedWorkout({ plannedWorkout })
    //   )
    // );

    // await Promise.all(
    //   result.create.map((plannedWorkout) =>
    //     createPlannedWorkout({ plannedWorkout })
    //   )
    // );

    // const updated = [...result.delete, ...result.create, ...result.update];

    // for (const workout of uniqBy(updated, (x) =>
    //   x.plannedAt.substring(0, 7)
    // )) {
    //   const [year, month] = workout.plannedAt.split("-");

    //   queryClient.refetchQueries({
    //     queryKey: ["workouts", Number(year), Number(month) - 1],
    //   });
    // }

    setDragging(null);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const overData = event.over?.data.current as Payload | undefined;
      const activeData = event.active?.data.current as Payload | undefined;
      const eventTarget = event.activatorEvent.target as HTMLElement;
      const clone = eventTarget?.getAttribute("data-action") === "clone";

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

      const getExercise = () => {
        if (source?.type == "plannedExercise") {
          return source.plannedExercise ?? null;
        }

        if (activeData?.type == "exercise") {
          return {
            id: v4(),
            name: activeData.exercise.name,
            exerciseId: activeData.exercise.id,
          } as PlannedExercise;
        }

        return null;
      };

      if (!target) {
        return;
      }

      const exercise = getExercise();
      const index = overData?.type == "plannedExercise" ? overData.index : null;
      const sourceMonthId = `${source?.date.year()}-${source?.date.month()}`;
      const sourceDate = source?.date.format(PLANNED_AT);
      const targetMonthId = `${target?.date.year()}-${target?.date.month()}`;
      const targetDate = target?.date.format(PLANNED_AT);

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
    [traineeId, dispatch]
  );

  return (
    <>
      <DndContext
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragCancel={() => setDragging(null)}
        onDragAbort={() => setDragging(null)}
        onDragStart={({ active }) => {
          setDragging(active.data.current?.label ?? null);
        }}
        collisionDetection={pointerWithin}
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
    </>
  );
}
