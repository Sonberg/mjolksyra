"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { useState } from "react";
import { v4 } from "uuid";

import { BlockWorkout, BlockExercise } from "@/services/blocks/type";
import { BlockWeek } from "./BlockWeek";
import { DraggingExercise } from "../DraggingExercise";

type Props = {
  workouts: BlockWorkout[];
  numberOfWeeks: number;
  onChange: (workouts: BlockWorkout[]) => void;
};

export function BlockBuilder({ workouts, numberOfWeeks, onChange }: Props) {
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    setDragging(null);

    const over = event.over;
    const active = event.active;

    if (!over) return;

    const overData = over.data.current;
    const activeData = active.data.current;

    if (!overData || overData.type !== "blockDay") return;

    const { week, dayOfWeek } = overData as { week: number; dayOfWeek: number };

    if (activeData?.type === "exercise") {
      // Dropping a library exercise into a block day
      const exercise = activeData.exercise;
      const newExercise: BlockExercise = {
        id: v4(),
        exerciseId: exercise.id,
        name: exercise.name,
        note: null,
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
        (w) => w.week === week && w.dayOfWeek === dayOfWeek
      );

      if (sourceWorkout.week === week && sourceWorkout.dayOfWeek === dayOfWeek) {
        return; // same day, no-op (sorting within day handled by sortable)
      }

      // Remove from source, add to target
      const updated = workouts
        .map((w) => {
          if (w.id === sourceWorkoutId) {
            const remaining = w.exercises.filter((e) => e.id !== exercise.id);
            if (remaining.length === 0) return null; // will be filtered
            return { ...w, exercises: remaining };
          }
          return w;
        })
        .filter(Boolean) as BlockWorkout[];

      if (targetWorkout) {
        onChange(
          updated.map((w) =>
            w.week === week && w.dayOfWeek === dayOfWeek
              ? { ...w, exercises: [...w.exercises, exercise] }
              : w
          )
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
            exercises: [exercise],
          },
        ]);
      }
    }
  };

  const addExerciseToDay = (
    week: number,
    dayOfWeek: number,
    exercise: BlockExercise
  ) => {
    const existing = workouts.find(
      (w) => w.week === week && w.dayOfWeek === dayOfWeek
    );

    if (existing) {
      onChange(
        workouts.map((w) =>
          w.week === week && w.dayOfWeek === dayOfWeek
            ? { ...w, exercises: [...w.exercises, exercise] }
            : w
        )
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
    exerciseId: string
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

  const weeks = Array.from({ length: numberOfWeeks }, (_, i) => i + 1);

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={(e) => setDragging(e.active.data.current?.label ?? null)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <div className="flex flex-col gap-6">
        {weeks.map((week) => (
          <BlockWeek
            key={week}
            week={week}
            workouts={workouts}
            onRemoveExercise={handleRemoveExercise}
          />
        ))}
      </div>
      {dragging
        ? createPortal(
            <DragOverlay>
              <DraggingExercise name={dragging} />
            </DragOverlay>,
            document.body
          )
        : null}
    </DndContext>
  );
}
