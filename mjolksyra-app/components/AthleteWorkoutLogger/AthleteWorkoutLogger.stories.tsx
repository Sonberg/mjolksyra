"use client"

import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { AthleteWorkoutLogger } from "./AthleteWorkoutLogger"
import { PlannedWorkout } from "@/services/plannedWorkouts/type"
import { ExerciseType } from "@/lib/exercisePrescription"

const meta = {
  title: "AthleteWorkoutLogger/AthleteWorkoutLogger",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const baseWorkout: PlannedWorkout = {
  id: "workout-1",
  traineeId: "trainee-1",
  name: "Push Day",
  note: null,
  plannedAt: "2026-03-09",
  completedAt: null,
  reviewedAt: null,
  media: [],
  createdAt: new Date("2026-03-01"),
  appliedBlock: null,
  exercises: [
    {
      id: "ex-1",
      exerciseId: "exercise-bench",
      name: "Bench Press",
      note: null,
      isPublished: true,
      isDone: false,
      prescription: {
        type: ExerciseType.SetsReps,
        sets: [
          { target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 80, note: null }, actual: null },
          { target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 80, note: null }, actual: null },
          { target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 80, note: null }, actual: null },
        ],
      },
    },
    {
      id: "ex-2",
      exerciseId: "exercise-ohp",
      name: "Overhead Press",
      note: null,
      isPublished: true,
      isDone: false,
      prescription: {
        type: ExerciseType.SetsReps,
        sets: [
          { target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 50, note: null }, actual: null },
          { target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 50, note: null }, actual: null },
        ],
      },
    },
    {
      id: "ex-3",
      exerciseId: "exercise-dip",
      name: "Tricep Dips",
      note: null,
      isPublished: true,
      isDone: false,
      prescription: null,
    },
  ],
}

export const NotCompleted: Story = {
  render: () => (
    <AthleteWorkoutLogger
      workout={baseWorkout}
      traineeId="trainee-1"
      backHref="/app/athlete/workouts"
    />
  ),
}

export const Completed: Story = {
  render: () => (
    <AthleteWorkoutLogger
      workout={{
        ...baseWorkout,
        completedAt: new Date("2026-03-09T14:30:00"),
        exercises: baseWorkout.exercises.map((e) => ({
          ...e,
          isDone: true,
          prescription: e.prescription
            ? {
                ...e.prescription,
                sets: (e.prescription.sets ?? []).map((s) => ({
                  ...s,
                  actual: {
                    reps: s.target?.reps ?? null,
                    weightKg: s.target?.weightKg ?? null,
                    durationSeconds: null,
                    distanceMeters: null,
                    note: null,
                    isDone: true,
                  },
                })),
              }
            : null,
        })),
      }}
      traineeId="trainee-1"
      backHref="/app/athlete/workouts"
    />
  ),
}

/** Incomplete workout with a completion note already typed in. */
export const NotCompletedWithNote: Story = {
  render: () => (
    <AthleteWorkoutLogger
      workout={baseWorkout}
      traineeId="trainee-1"
      backHref="/app/athlete/workouts"
    />
  ),
}

export const WithNotes: Story = {
  render: () => (
    <AthleteWorkoutLogger
      workout={{
        ...baseWorkout,
        note: "Focus on your form today. Keep the intensity moderate — this is a volume week.",
        completedAt: new Date("2026-03-09T15:00:00"),
      }}
      traineeId="trainee-1"
      backHref="/app/athlete/workouts"
    />
  ),
}
