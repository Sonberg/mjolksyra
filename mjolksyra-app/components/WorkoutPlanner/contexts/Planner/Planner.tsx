"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";

import { v4 } from "uuid";
import { ReactNode, useCallback, useState } from "react";
import { createPortal } from "react-dom";

import { parse, Payload } from "./parse";
import { transform } from "./transformers";
import { DeletePlannedWorkout } from "@/services/plannedWorkouts/deletePlannedWorkout";
import { CreatePlannedWorkout } from "@/services/plannedWorkouts/createPlannedWorkout";
import { UpdatePlannedWorkout } from "@/services/plannedWorkouts/updatePlannedWorkout";
import { PlannedExercise, PlannedWorkout } from "@/services/plannedWorkouts/type";
import { ApplyBlock } from "@/services/blocks/applyBlock";
import { useWorkouts } from "../Workouts";
import { PLANNED_AT } from "@/constants/dateFormats";
import { DraggingExercise } from "@/components/DraggingExercise";
import { insertAt } from "@/lib/insertAt";
import { getExercise, isDraggingWeek, isDraggingWorkout } from "./utils";
import { CloningContext, isCloning } from "./cloning";
import { MonthWorkouts } from "../Workouts/workoutsReducer";
import { workoutEmpty } from "@/lib/workoutEmpty";

type Args = {
  traineeId: string;
  children: ReactNode;
  plannedWorkouts: {
    update: UpdatePlannedWorkout;
    create: CreatePlannedWorkout;
    delete: DeletePlannedWorkout;
  };
  applyBlock?: ApplyBlock;
};

type Clone = {
  targetMonth: string;
  targetDate: string;
  targetWorkout?: PlannedWorkout;
  exercise: PlannedExercise;
  index: number;
};

export function PlannerProvider({
  traineeId,
  children,
  plannedWorkouts,
  applyBlock,
}: Args) {
  const { dispatch, reload, data } = useWorkouts();

  const [dragging, setDragging] = useState<string | null>(null);
  const [cloning, setCloning] = useState<Clone | null>(null);
  const [state, setState] = useState<MonthWorkouts>(data);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setDragging(null);
      setCloning(null);
      setState(data);

      if (cloning) {
        if (cloning.targetWorkout) {
          await plannedWorkouts.update({
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
          await plannedWorkouts.create({
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

      const activeDataRaw = event.active?.data.current as unknown;
      const overDataRaw = event.over?.data.current as unknown;
      const activeData = activeDataRaw as Payload | undefined;
      const overData = overDataRaw as Payload | undefined;

      type BlockPayload = { type: "block"; block: { id: string; numberOfWeeks: number } };
      const activeAsBlock = activeDataRaw as BlockPayload | undefined;

      if (activeAsBlock?.type === "block" && overData?.type === "week" && applyBlock) {
        const weekData = overData as Extract<Payload, { type: "week" }>;
        const monday = weekData.days[0];
        const startDate = monday.format(PLANNED_AT);
        const blockData = activeAsBlock;

        await applyBlock({ blockId: blockData.block.id, traineeId, startDate });

        for (let w = 0; w < blockData.block.numberOfWeeks; w++) {
          const d = monday.add(w, "week");
          await reload(`${d.year()}-${d.month()}`);
        }
        return;
      }

      const action = parse(event, {
        new: data,
        old: state,
      });

      const result = transform(traineeId, action);

      console.log(action, result);

      await Promise.all(
        result.delete.map((plannedWorkout) =>
          plannedWorkouts.delete({ plannedWorkout })
        )
      );

      await Promise.all(
        result.update.map((plannedWorkout) =>
          workoutEmpty(plannedWorkout)
            ? plannedWorkouts.delete({ plannedWorkout })
            : plannedWorkouts.update({ plannedWorkout })
        )
      );

      await Promise.all(
        result.create.map((plannedWorkout) =>
          plannedWorkouts.create({ plannedWorkout })
        )
      );

      const updated = [...result.create, ...result.delete, ...result.update];
      const tasks = updated
        .map((x) => x.plannedAt.split("-"))
        .map(([year, month]) => reload(`${year}-${Number(month) - 1}`));

      await Promise.all(tasks);
    },
    [data, cloning, state, traineeId, reload, plannedWorkouts, applyBlock]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const overData = event.over?.data.current as Payload | undefined;
      const activeData = event.active?.data.current as Payload | undefined;

      // Block drags don't need live preview
      if ((event.active?.data.current as { type?: string })?.type === "block") return;

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
            console.log({ clone: isCloning(event) });
            setDragging(event.active.data.current?.label ?? null);
            setState(Object.freeze(data));
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
