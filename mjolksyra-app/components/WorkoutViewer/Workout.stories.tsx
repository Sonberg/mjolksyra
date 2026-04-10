"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Workout } from "./Workout";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { ExerciseType } from "@/lib/exercisePrescription";

const meta = {
  title: "WorkoutViewer/Workout",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const baseWorkout: PlannedWorkout = {
  id: "workout-1",
  traineeId: "trainee-1",
  name: "Lower Body Strength",
  note: "Keep rest around 2 minutes and lock in your squat depth.",
  plannedAt: "2026-04-02",
  createdAt: new Date("2026-04-01"),
  appliedBlock: null,
  publishedExercises: [
    {
      id: "exercise-1",
      exerciseId: "squat",
      name: "Back Squat",
      note: null,
      isDone: false,
      isPublished: true,
      addedBy: null,
      prescription: {
        type: ExerciseType.SetsReps,
        sets: [
          {
            target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null },
            actual: null,
          },
          {
            target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null },
            actual: null,
          },
        ],
      },
    },
    {
      id: "exercise-2",
      exerciseId: "rdl",
      name: "Romanian Deadlift",
      note: null,
      isDone: false,
      isPublished: true,
      addedBy: null,
      prescription: {
        type: ExerciseType.SetsReps,
        sets: [
          {
            target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 70, note: null },
            actual: null,
          },
          {
            target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 70, note: null },
            actual: null,
          },
        ],
      },
    },
    {
      id: "exercise-3",
      exerciseId: "lunges",
      name: "Walking Lunges",
      note: null,
      isDone: false,
      isPublished: true,
      addedBy: null,
      prescription: {
        type: ExerciseType.DistanceMeters,
        sets: [
          {
            target: { reps: null, durationSeconds: null, distanceMeters: 40, weightKg: null, note: null },
            actual: null,
          },
        ],
      },
    },
  ],
  draftExercises: null,
};

export const AthleteUpcomingCard: Story = {
  render: () => (
    <Workout
      workout={baseWorkout}
      viewerMode="athlete"
      traineeId="trainee-1"
      backTab="future"
    />
  ),
};

export const AthleteCompletedCard: Story = {
  render: () => (
    <Workout
      workout={baseWorkout}
      viewerMode="athlete"
      traineeId="trainee-1"
      backTab="past"
    />
  ),
};

export const CoachNeedsReviewCard: Story = {
  render: () => (
    <Workout
      workout={baseWorkout}
      viewerMode="coach"
      traineeId="trainee-1"
      backTab="changes"
    />
  ),
};

export const WithDraftExercises: Story = {
  render: () => (
    <Workout
      workout={{
        ...baseWorkout,
        draftExercises: [
          {
            id: "draft-1",
            exerciseId: "bench",
            name: "Bench Press",
            note: "Staged by coach",
            isDone: false,
            isPublished: false,
            addedBy: "Coach",
            prescription: {
              type: ExerciseType.SetsReps,
              sets: [
                { target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 60, note: null }, actual: null },
              ],
            },
          },
        ],
      }}
      viewerMode="coach"
      traineeId="trainee-1"
    />
  ),
};
