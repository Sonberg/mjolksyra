"use client";

import { DragEndEvent, useDndMonitor } from "@dnd-kit/core";
import { v4 } from "uuid";

import { BlockWorkout, BlockExercise } from "@/services/blocks/type";
import { BlockWeek } from "./BlockWeek";
import {
  ExercisePrescription,
  ExerciseType,
} from "@/lib/exercisePrescription";

type Props = {
  workouts: BlockWorkout[];
  numberOfWeeks: number;
  onChange: (workouts: BlockWorkout[]) => void;
  onEditExercise: (week: number, dayOfWeek: number) => void;
  onAddExercise: (week: number, dayOfWeek: number) => void;
  selectedWorkout: { week: number; dayOfWeek: number } | null;
};

export function BlockBuilder({
  workouts,
  numberOfWeeks,
  onChange,
  onEditExercise,
  onAddExercise,
  selectedWorkout,
}: Props) {
  const getActionTarget = (el: HTMLElement | null): HTMLElement | null => {
    if (!el) return null;
    return el.hasAttribute("data-action")
      ? el
      : el.parentElement
        ? getActionTarget(el.parentElement)
        : null;
  };

  function defaultBlockPrescription(): ExercisePrescription {
    return {
      type: ExerciseType.SetsReps,
      sets: [
        {
          target: {
            reps: null,
            durationSeconds: null,
            distanceMeters: null,
            weightKg: null,
            note: null,
          },
          actual: null,
        },
      ],
    };
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const over = event.over;
    const active = event.active;

    if (!over) return;

    const overData = over.data.current;
    const activeData = active.data.current;

    if (!overData || overData.type !== "blockDay") return;
    const action = getActionTarget(event.activatorEvent.target as HTMLElement)?.getAttribute(
      "data-action",
    );
    const isCloneAction = action === "clone";

    const { week, dayOfWeek } = overData as { week: number; dayOfWeek: number };

    if (activeData?.type === "exercise") {
      // Dropping a library exercise into a block day
      const exercise = activeData.exercise;
      const newExercise: BlockExercise = {
        id: v4(),
        exerciseId: exercise.id,
        name: exercise.name,
        note: null,
        prescription: defaultBlockPrescription(),
      };
      addExerciseToDay(week, dayOfWeek, newExercise);
      return;
    }

    if (activeData?.type === "blockExercise") {
      // Moving a block exercise to a different day
      const exercise = activeData.exercise as BlockExercise;
      const sourceWorkoutId = activeData.blockWorkoutId as string;

      const sourceWorkout = workouts.find((w) => w.id === sourceWorkoutId);
      if (!sourceWorkout) return;

      const targetWorkout = workouts.find(
        (w) => w.week === week && w.dayOfWeek === dayOfWeek,
      );

      if (sourceWorkout.week === week && sourceWorkout.dayOfWeek === dayOfWeek) {
        if (!isCloneAction) {
          return; // same day, no-op (sorting within day handled by sortable)
        }

        addExerciseToDay(week, dayOfWeek, { ...exercise, id: v4() });
        return;
      }

      // Remove from source, add to target
      const exerciseToAdd = isCloneAction ? { ...exercise, id: v4() } : exercise;
      const updated = isCloneAction
        ? workouts
        : (workouts
            .map((w) => {
              if (w.id === sourceWorkoutId) {
                const remaining = w.exercises.filter((e) => e.id !== exercise.id);
                if (remaining.length === 0) return null; // will be filtered
                return { ...w, exercises: remaining };
              }
              return w;
            })
            .filter(Boolean) as BlockWorkout[]);

      if (targetWorkout) {
        onChange(
          updated.map((w) =>
            w.week === week && w.dayOfWeek === dayOfWeek
              ? { ...w, exercises: [...w.exercises, exerciseToAdd] }
              : w,
          ),
        );
      } else {
        onChange([
          ...updated,
          {
            id: v4(),
            name: null,
            note: null,
            week,
            dayOfWeek,
            exercises: [exerciseToAdd],
          },
        ]);
      }
    }

    if (activeData?.type === "blockWorkout") {
      const sourceWorkout = activeData.workout as BlockWorkout | undefined;
      if (!sourceWorkout) return;

      const targetWorkout = workouts.find(
        (w) => w.week === week && w.dayOfWeek === dayOfWeek,
      );

      if (sourceWorkout.week === week && sourceWorkout.dayOfWeek === dayOfWeek) {
        if (!isCloneAction) {
          return;
        }

        const clonedExercises = sourceWorkout.exercises.map((exercise) => ({
          ...exercise,
          id: v4(),
        }));

        onChange(
          workouts.map((w) =>
            w.week === week && w.dayOfWeek === dayOfWeek
              ? { ...w, exercises: [...w.exercises, ...clonedExercises] }
              : w,
          ),
        );
        return;
      }

      if (isCloneAction) {
        const clonedExercises = sourceWorkout.exercises.map((exercise) => ({
          ...exercise,
          id: v4(),
        }));

        if (targetWorkout) {
          onChange(
            workouts.map((w) =>
              w.week === week && w.dayOfWeek === dayOfWeek
                ? { ...w, exercises: [...w.exercises, ...clonedExercises] }
                : w,
            ),
          );
        } else {
          onChange([
            ...workouts,
            {
              ...sourceWorkout,
              id: v4(),
              week,
              dayOfWeek,
              exercises: clonedExercises,
            },
          ]);
        }
        return;
      }

      const withoutSource = workouts.filter((w) => w.id !== sourceWorkout.id);

      if (targetWorkout) {
        onChange(
          withoutSource.map((w) =>
            w.id === targetWorkout.id
              ? { ...w, exercises: [...w.exercises, ...sourceWorkout.exercises] }
              : w,
          ),
        );
      } else {
        onChange([
          ...withoutSource,
          {
            ...sourceWorkout,
            week,
            dayOfWeek,
          },
        ]);
      }
      return;
    }
  };

  const addExerciseToDay = (
    week: number,
    dayOfWeek: number,
    exercise: BlockExercise,
  ) => {
    const existing = workouts.find(
      (w) => w.week === week && w.dayOfWeek === dayOfWeek,
    );

    if (existing) {
      onChange(
        workouts.map((w) =>
          w.week === week && w.dayOfWeek === dayOfWeek
            ? { ...w, exercises: [...w.exercises, exercise] }
            : w,
        ),
      );
    } else {
      onChange([
        ...workouts,
        {
          id: v4(),
          name: null,
          note: null,
          week,
          dayOfWeek,
          exercises: [exercise],
        },
      ]);
    }
  };

  const handleRemoveExercise = (
    week: number,
    dayOfWeek: number,
    exerciseId: string,
  ) => {
    const updated = workouts
      .map((w) => {
        if (w.week !== week || w.dayOfWeek !== dayOfWeek) return w;
        const remaining = w.exercises.filter((e) => e.id !== exerciseId);
        if (remaining.length === 0) return null;
        return { ...w, exercises: remaining };
      })
      .filter(Boolean) as BlockWorkout[];

    onChange(updated);
  };

  const handleRemoveWorkout = (week: number, dayOfWeek: number) => {
    onChange(workouts.filter((w) => !(w.week === week && w.dayOfWeek === dayOfWeek)));
  };

  const weeks = Array.from({ length: numberOfWeeks }, (_, i) => i + 1);

  useDndMonitor({
    onDragEnd: handleDragEnd,
  });

  return (
    <div className="flex flex-col gap-6">
      {weeks.map((week) => (
        <BlockWeek
          key={week}
          week={week}
          workouts={workouts}
          onRemoveExercise={handleRemoveExercise}
          onEditExercise={onEditExercise}
          onAddExercise={onAddExercise}
          onRemoveWorkout={handleRemoveWorkout}
          selectedWorkout={selectedWorkout}
        />
      ))}
    </div>
  );
}
