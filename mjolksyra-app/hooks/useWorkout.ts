"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logPlannedWorkout } from "@/services/plannedWorkouts/logPlannedWorkout";
import { updatePlannedWorkout } from "@/services/plannedWorkouts/updatePlannedWorkout";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { ExerciseType } from "@/lib/exercisePrescription";

type UseWorkoutProps = {
  workout: PlannedWorkout;
};

export function useWorkout({ workout }: UseWorkoutProps) {
  const queryClient = useQueryClient();

  function buildLogPayload(overrides: {
    completedAt?: Date | null;
    markAllExercisesDone?: boolean;
    exerciseActualOverride?: {
      exerciseId: string;
      setIndex?: number;
      isDone?: boolean;

      weightKg?: number | null;
      reps?: number | null;
      durationSeconds?: number | null;
      distanceMeters?: number | null;
      note?: string | null;
      toggleSetDone?: boolean;
    };
  }) {
    return {
      completedAt:
        overrides.completedAt !== undefined
          ? overrides.completedAt
          : workout.completedAt ?? null,
      mediaUrls: [],
      exercises: workout.exercises.map((e) => ({
        id: e.id,
        sets: (e.prescription?.sets ?? []).map((s, idx) => {
          if (overrides.markAllExercisesDone) {
            return {
              reps: s.actual?.reps ?? null,
              weightKg: s.actual?.weightKg ?? null,
              durationSeconds: s.actual?.durationSeconds ?? null,
              distanceMeters: s.actual?.distanceMeters ?? null,
              note: s.actual?.note ?? null,
              isDone: true,
            };
          }

          const override = overrides.exerciseActualOverride;
          if (override && override.exerciseId === e.id) {
            if (override.setIndex !== undefined && override.setIndex === idx) {
              return {
                reps:
                  override.reps !== undefined
                    ? override.reps
                    : s.actual?.reps ?? null,
                weightKg:
                  override.weightKg !== undefined
                    ? override.weightKg
                    : s.actual?.weightKg ?? null,
                durationSeconds:
                  override.durationSeconds !== undefined
                    ? override.durationSeconds
                    : s.actual?.durationSeconds ?? null,
                distanceMeters:
                  override.distanceMeters !== undefined
                    ? override.distanceMeters
                    : s.actual?.distanceMeters ?? null,
                note:
                  override.note !== undefined
                    ? override.note
                    : s.actual?.note ?? null,
                isDone: override.toggleSetDone
                  ? !(s.actual?.isDone ?? false)
                  : override.isDone !== undefined
                  ? override.isDone
                  : s.actual?.isDone ?? false,
              };
            }
            if (override.setIndex === undefined) {
              return {
                reps: s.actual?.reps ?? null,
                weightKg: s.actual?.weightKg ?? null,
                durationSeconds: s.actual?.durationSeconds ?? null,
                distanceMeters: s.actual?.distanceMeters ?? null,
                note: s.actual?.note ?? null,
                isDone:
                  override.isDone !== undefined
                    ? override.isDone
                    : s.actual?.isDone ?? false,
              };
            }
          }
          return {
            reps: s.actual?.reps ?? null,
            weightKg: s.actual?.weightKg ?? null,
            durationSeconds: s.actual?.durationSeconds ?? null,
            distanceMeters: s.actual?.distanceMeters ?? null,
            note: s.actual?.note ?? null,
            isDone: s.actual?.isDone ?? false,
          };
        }),
      })),
    };
  }

  const saveCompletion = useMutation({
    mutationFn: async ({
      completedAt,
      markAllExercisesDone,
    }: {
      completedAt: Date | null;
      markAllExercisesDone?: boolean;
    }) =>
      logPlannedWorkout({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
        log: buildLogPayload({ completedAt, markAllExercisesDone }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
    },
  });

  const saveReview = useMutation({
    mutationFn: async ({ reviewedAt }: { reviewedAt: Date | null }) =>
      updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          reviewedAt,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
    },
  });

  const toggleExerciseDone = useMutation({
    mutationFn: async ({
      exerciseId,
      isDone,
    }: {
      exerciseId: string;
      isDone: boolean;
    }) =>
      logPlannedWorkout({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
        log: buildLogPayload({
          exerciseActualOverride: { exerciseId, isDone },
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const toggleSetDone = useMutation({
    mutationFn: async ({
      exerciseId,
      setIndex,
    }: {
      exerciseId: string;
      setIndex: number;
    }) =>
      logPlannedWorkout({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
        log: buildLogPayload({
          exerciseActualOverride: { exerciseId, setIndex, toggleSetDone: true },
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const updateSetWeight = useMutation({
    mutationFn: async ({
      exerciseId,
      setIndex,
      weightKg,
      reps,
      durationSeconds,
      distanceMeters,
      note,
    }: {
      exerciseId: string;
      setIndex: number;
      weightKg: number | null;
      reps: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
      note: string | null;
    }) =>
      logPlannedWorkout({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
        log: buildLogPayload({
          exerciseActualOverride: {
            exerciseId,
            setIndex,
            weightKg,
            reps,
            durationSeconds,
            distanceMeters,
            note,
          },
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const addExercise = useMutation({
    mutationFn: async ({
      exercise,
    }: {
      exercise: PlannedWorkout["exercises"][number];
    }) =>
      updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          exercises: [...workout.exercises, exercise],
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const removeExercise = useMutation({
    mutationFn: async ({ exerciseId }: { exerciseId: string }) =>
      updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          exercises: workout.exercises.filter((e) => e.id !== exerciseId),
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const addSetRow = useMutation({
    mutationFn: async ({ exerciseId }: { exerciseId: string }) => {
      const exercise = workout.exercises.find((e) => e.id === exerciseId);
      if (!exercise) return;
      const type = exercise.prescription?.type ?? ExerciseType.SetsReps;
      const existingSets = exercise.prescription?.sets ?? [];
      return updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          exercises: workout.exercises.map((e) =>
            e.id !== exerciseId
              ? e
              : {
                  ...e,
                  prescription: {
                    type,
                    sets: [...existingSets, { target: null, actual: null }],
                  },
                },
          ),
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const removeSetRow = useMutation({
    mutationFn: async ({
      exerciseId,
      setIndex,
    }: {
      exerciseId: string;
      setIndex: number;
    }) => {
      const exercise = workout.exercises.find((e) => e.id === exerciseId);
      if (!exercise) return;
      const existingSets = exercise.prescription?.sets ?? [];
      return updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          exercises: workout.exercises.map((e) =>
            e.id !== exerciseId
              ? e
              : {
                  ...e,
                  prescription: {
                    type: e.prescription?.type ?? ExerciseType.SetsReps,
                    sets: existingSets.filter((_, i) => i !== setIndex),
                  },
                },
          ),
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  return {
    saveCompletion,
    saveReview,
    toggleExerciseDone,
    toggleSetDone,
    updateSetWeight,
    addExercise,
    removeExercise,
    addSetRow,
    removeSetRow,
  };
}
