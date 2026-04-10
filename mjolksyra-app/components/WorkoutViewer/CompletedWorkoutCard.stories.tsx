import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CompletedWorkoutCard } from "./CompletedWorkoutCard";
import { ExerciseType } from "@/lib/exercisePrescription";
import { CompletedWorkout } from "@/services/completedWorkouts/type";

const meta = {
  title: "WorkoutViewer/CompletedWorkoutCard",
  component: CompletedWorkoutCard,
  args: {
    traineeId: "trainee-1",
  },
} satisfies Meta<typeof CompletedWorkoutCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseWorkout: CompletedWorkout = {
  id: "completed-1",
  plannedWorkoutId: "planned-1",
  traineeId: "trainee-1",
  plannedAt: "2026-04-02",
  completedAt: new Date("2026-04-02T08:30:00.000Z"),
  createdAt: new Date("2026-04-02T07:00:00.000Z"),
  media: [],
  exercises: [
    {
      id: "exercise-1",
      exerciseId: "bench",
      name: "Bench Press",
      note: null,
      isDone: true,
      prescription: {
        type: ExerciseType.SetsReps,
        sets: [
          {
            target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 90, note: null },
            actual: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 90, note: null, isDone: true },
          },
        ],
      },
    },
  ],
};

export const PlannedBacked: Story = {
  args: {
    workout: baseWorkout,
    viewerMode: "coach",
    backTab: "completed",
  },
};

export const AdHoc: Story = {
  args: {
    workout: {
      ...baseWorkout,
      id: "completed-adhoc-1",
      plannedWorkoutId: null,
    },
    viewerMode: "athlete",
    backTab: "completed",
  },
};
