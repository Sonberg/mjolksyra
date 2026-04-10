"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkoutSession } from "@/services/completedWorkouts/updateWorkoutSession";
import { startWorkoutSession } from "@/services/completedWorkouts/startWorkoutSession";
import { updatePlannedWorkout } from "@/services/plannedWorkouts/updatePlannedWorkout";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { WorkoutSessionResponse, CompletedExercise } from "@/services/completedWorkouts/type";
import { ExerciseType } from "@/lib/exercisePrescription";

type UseWorkoutProps = {
  workout: PlannedWorkout;
  session: WorkoutSessionResponse | null;
};

export function useWorkout({ workout, session }: UseWorkoutProps) {
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
    const exercises: CompletedExercise[] = (session?.exercises ?? []).map((e) => ({
      ...e,
      prescription: e.prescription
        ? {
            ...e.prescription,
            sets: (e.prescription?.sets ?? []).map((s, idx) => {
              if (overrides.markAllExercisesDone) {
                return {
                  ...s,
                  actual: {
                    reps: s.actual?.reps ?? null,
                    weightKg: s.actual?.weightKg ?? null,
                    durationSeconds: s.actual?.durationSeconds ?? null,
                    distanceMeters: s.actual?.distanceMeters ?? null,
                    note: s.actual?.note ?? null,
                    isDone: true,
                  },
                };
              }

              const override = overrides.exerciseActualOverride;
              if (override && override.exerciseId === e.id) {
                if (override.setIndex !== undefined && override.setIndex === idx) {
                  return {
                    ...s,
                    actual: {
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
                    },
                  };
                }
                if (override.setIndex === undefined) {
                  return {
                    ...s,
                    actual: {
                      reps: s.actual?.reps ?? null,
                      weightKg: s.actual?.weightKg ?? null,
                      durationSeconds: s.actual?.durationSeconds ?? null,
                      distanceMeters: s.actual?.distanceMeters ?? null,
                      note: s.actual?.note ?? null,
                      isDone:
                        override.isDone !== undefined
                          ? override.isDone
                          : s.actual?.isDone ?? false,
                    },
                  };
                }
              }
              return s;
            }),
          }
        : null,
    }));

    return {
      completedAt:
        overrides.completedAt !== undefined
          ? overrides.completedAt
          : session?.completedAt ?? null,
      mediaUrls: (session?.media ?? []).map((m) => m.rawUrl),
      exercises,
    };
  }

  const startSession = useMutation({
    mutationFn: async () =>
      startWorkoutSession({
        traineeId: workout.traineeId,
        plannedWorkoutId: workout.id,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
      await queryClient.invalidateQueries({ queryKey: ["workout-session"] });
    },
  });

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
        id: session!.id,
        session: buildSessionPayload({ completedAt, markAllExercisesDone }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["workout-session"] });
    },
  });

  const saveReview = useMutation({
    mutationFn: async ({ reviewedAt }: { reviewedAt: Date | null }) =>
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: session!.id,
        session: {
          ...buildSessionPayload({}),
          reviewedAt,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["workout-session"] });
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
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: session!.id,
        session: buildSessionPayload({
          exerciseActualOverride: { exerciseId, isDone },
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
      await queryClient.invalidateQueries({ queryKey: ["workout-session"] });
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
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: session!.id,
        session: buildSessionPayload({
          exerciseActualOverride: { exerciseId, setIndex, toggleSetDone: true },
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
      await queryClient.invalidateQueries({ queryKey: ["workout-session"] });
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
      updateWorkoutSession({
        traineeId: workout.traineeId,
        id: session!.id,
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
      await queryClient.invalidateQueries({ queryKey: ["workout-session"] });
    },
  });

  // Coach-side exercise editing uses draftExercises (falls back to publishedExercises)
  const draftExercises = workout.draftExercises ?? workout.publishedExercises;

  const addExercise = useMutation({
    mutationFn: async ({
      exercise,
    }: {
      exercise: PlannedWorkout["publishedExercises"][number];
    }) =>
      updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          draftExercises: [...draftExercises, exercise],
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
          draftExercises: draftExercises.filter((e) => e.id !== exerciseId),
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const addSetRow = useMutation({
    mutationFn: async ({ exerciseId }: { exerciseId: string }) => {
      const exercise = draftExercises.find((e) => e.id === exerciseId);
      if (!exercise) return;
      const type = exercise.prescription?.type ?? ExerciseType.SetsReps;
      const existingSets = exercise.prescription?.sets ?? [];
      return updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          draftExercises: draftExercises.map((e) =>
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
      const exercise = draftExercises.find((e) => e.id === exerciseId);
      if (!exercise) return;
      const existingSets = exercise.prescription?.sets ?? [];
      return updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          draftExercises: draftExercises.map((e) =>
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
    startSession,
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
