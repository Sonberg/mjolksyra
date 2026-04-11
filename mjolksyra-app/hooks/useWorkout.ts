"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkoutSession } from "@/services/completedWorkouts/updateWorkoutSession";
import { restoreWorkoutSession } from "@/services/completedWorkouts/restoreWorkoutSession";
import { CompletedExercise, CompletedWorkout } from "@/services/completedWorkouts/type";
import { ExerciseType } from "@/lib/exercisePrescription";

type UseWorkoutProps = {
  workout: CompletedWorkout;
};

export function useWorkout({ workout }: UseWorkoutProps) {
  const queryClient = useQueryClient();

  function buildSessionPayload(overrides: {
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
    const exercises: CompletedExercise[] = (workout.exercises ?? []).map((exercise) => ({
      ...exercise,
      prescription: exercise.prescription
        ? {
            ...exercise.prescription,
            sets: (exercise.prescription.sets ?? []).map((set, idx) => {
              if (overrides.markAllExercisesDone) {
                return {
                  ...set,
                  actual: {
                    reps: set.actual?.reps ?? null,
                    weightKg: set.actual?.weightKg ?? null,
                    durationSeconds: set.actual?.durationSeconds ?? null,
                    distanceMeters: set.actual?.distanceMeters ?? null,
                    note: set.actual?.note ?? null,
                    isDone: true,
                  },
                };
              }

              const override = overrides.exerciseActualOverride;
              if (override && override.exerciseId === exercise.id) {
                if (override.setIndex !== undefined && override.setIndex === idx) {
                  return {
                    ...set,
                    actual: {
                      reps: override.reps !== undefined ? override.reps : set.actual?.reps ?? null,
                      weightKg: override.weightKg !== undefined ? override.weightKg : set.actual?.weightKg ?? null,
                      durationSeconds:
                        override.durationSeconds !== undefined
                          ? override.durationSeconds
                          : set.actual?.durationSeconds ?? null,
                      distanceMeters:
                        override.distanceMeters !== undefined
                          ? override.distanceMeters
                          : set.actual?.distanceMeters ?? null,
                      note: override.note !== undefined ? override.note : set.actual?.note ?? null,
                      isDone: override.toggleSetDone
                        ? !(set.actual?.isDone ?? false)
                        : override.isDone !== undefined
                          ? override.isDone
                          : set.actual?.isDone ?? false,
                    },
                  };
                }

                if (override.setIndex === undefined) {
                  return {
                    ...set,
                    actual: {
                      reps: set.actual?.reps ?? null,
                      weightKg: set.actual?.weightKg ?? null,
                      durationSeconds: set.actual?.durationSeconds ?? null,
                      distanceMeters: set.actual?.distanceMeters ?? null,
                      note: set.actual?.note ?? null,
                      isDone: override.isDone !== undefined ? override.isDone : set.actual?.isDone ?? false,
                    },
                  };
                }
              }

              return set;
            }),
          }
        : null,
    }));

    return {
      completedAt: overrides.completedAt !== undefined ? overrides.completedAt : workout.completedAt ?? null,
      mediaUrls: (workout.media ?? []).map((media) => media.rawUrl),
      exercises,
    };
  }

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["completed-workouts"] });
    await queryClient.invalidateQueries({ queryKey: ["workout-session"] });
    await queryClient.invalidateQueries({ queryKey: ["completed-workout-analysis"] });
  }

  const saveCompletion = useMutation({
    mutationFn: async ({
      completedAt,
      markAllExercisesDone,
    }: {
      completedAt: Date | null;
      markAllExercisesDone?: boolean;
    }) =>
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: workout.id,
        session: buildSessionPayload({ completedAt, markAllExercisesDone }),
      }),
    onSuccess: invalidate,
  });

  const toggleExerciseDone = useMutation({
    mutationFn: async ({ exerciseId, isDone }: { exerciseId: string; isDone: boolean }) =>
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: workout.id,
        session: buildSessionPayload({
          exerciseActualOverride: { exerciseId, isDone },
        }),
      }),
    onSuccess: invalidate,
  });

  const toggleSetDone = useMutation({
    mutationFn: async ({ exerciseId, setIndex }: { exerciseId: string; setIndex: number }) =>
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: workout.id,
        session: buildSessionPayload({
          exerciseActualOverride: { exerciseId, setIndex, toggleSetDone: true },
        }),
      }),
    onSuccess: invalidate,
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
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: workout.id,
        session: buildSessionPayload({
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
    onSuccess: invalidate,
  });

  const addExercise = useMutation({
    mutationFn: async ({ exercise }: { exercise: CompletedExercise }) =>
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: workout.id,
        session: {
          completedAt: workout.completedAt ?? null,
          mediaUrls: (workout.media ?? []).map((media) => media.rawUrl),
          exercises: [...workout.exercises, exercise],
        },
      }),
    onSuccess: invalidate,
  });

  const removeExercise = useMutation({
    mutationFn: async ({ exerciseId }: { exerciseId: string }) =>
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: workout.id,
        session: {
          completedAt: workout.completedAt ?? null,
          mediaUrls: (workout.media ?? []).map((media) => media.rawUrl),
          exercises: workout.exercises.filter((exercise) => exercise.id !== exerciseId),
        },
      }),
    onSuccess: invalidate,
  });

  const addSetRow = useMutation({
    mutationFn: async ({ exerciseId }: { exerciseId: string }) => {
      const exercise = workout.exercises.find((item) => item.id === exerciseId);
      if (!exercise) return;

      const type = exercise.prescription?.type ?? ExerciseType.SetsReps;
      const existingSets = exercise.prescription?.sets ?? [];
      const updatedExercises = workout.exercises.map((item) =>
        item.id !== exerciseId
          ? item
          : {
              ...item,
              prescription: {
                type,
                sets: [...existingSets, { target: null, actual: null }],
              },
            },
      );

      return updateWorkoutSession({
        traineeId: workout.traineeId,
        id: workout.id,
        session: {
          completedAt: workout.completedAt ?? null,
          mediaUrls: (workout.media ?? []).map((media) => media.rawUrl),
          exercises: updatedExercises,
        },
      });
    },
    onSuccess: invalidate,
  });

  const removeSetRow = useMutation({
    mutationFn: async ({ exerciseId, setIndex }: { exerciseId: string; setIndex: number }) => {
      const exercise = workout.exercises.find((item) => item.id === exerciseId);
      if (!exercise) return;

      const existingSets = exercise.prescription?.sets ?? [];
      const updatedExercises = workout.exercises.map((item) =>
        item.id !== exerciseId
          ? item
          : {
              ...item,
              prescription: {
                type: item.prescription?.type ?? ExerciseType.SetsReps,
                sets: existingSets.filter((_, index) => index !== setIndex),
              },
            },
      );

      return updateWorkoutSession({
        traineeId: workout.traineeId,
        id: workout.id,
        session: {
          completedAt: workout.completedAt ?? null,
          mediaUrls: (workout.media ?? []).map((media) => media.rawUrl),
          exercises: updatedExercises,
        },
      });
    },
    onSuccess: invalidate,
  });

  const restore = useMutation({
    mutationFn: () =>
      restoreWorkoutSession({
        traineeId: workout.traineeId,
        workoutId: workout.id,
      }),
    onSuccess: invalidate,
  });

  return {
    saveCompletion,
    toggleExerciseDone,
    toggleSetDone,
    updateSetWeight,
    addExercise,
    removeExercise,
    addSetRow,
    removeSetRow,
    restore,
  };
}
