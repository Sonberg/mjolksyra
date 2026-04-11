import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutDetail } from "./WorkoutDetail";
import { CompletedWorkout } from "@/services/completedWorkouts/type";
import { ExerciseType } from "@/lib/exercisePrescription";
import { PropsWithChildren } from "react";

const StoryProvider = ({ children }: PropsWithChildren) => (
  <div className="mx-auto max-w-4xl">{children}</div>
);

const meta = {
  title: "WorkoutViewer/WorkoutDetail",
  component: WorkoutDetail,
  decorators: [
    (Story) => (
      <StoryProvider>
        <Story />
      </StoryProvider>
    ),
  ],
} satisfies Meta<typeof WorkoutDetail>;

export default meta;
type Story = StoryObj<typeof WorkoutDetail>;

const baseWorkout: CompletedWorkout = {
  id: "session-1",
  plannedWorkoutId: "workout-1",
  traineeId: "trainee-1",
  plannedAt: "2026-04-02",
  completedAt: new Date("2026-04-02T11:15:00Z"),
  media: [],
  createdAt: new Date("2026-04-01"),
  exercises: [
    {
      id: "exercise-1",
      exerciseId: "squat",
      name: "Back Squat",
      note: null,
      isDone: true,
      prescription: {
        type: ExerciseType.SetsReps,
        sets: [
          {
            target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null },
            actual: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null, isDone: true },
          },
          {
            target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null },
            actual: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 102.5, note: null, isDone: true },
          },
        ],
      },
    },
  ],
};

export const AthleteView: Story = {
  render: () => (
    <WorkoutDetail
      workout={{ ...baseWorkout, completedAt: null }}
      viewerMode="athlete"
    />
  ),
};

export const CoachView: Story = {
  render: () => (
    <WorkoutDetail
      workout={baseWorkout}
      viewerMode="coach"
    />
  ),
};

export const AdHocSession: Story = {
  render: () => (
    <WorkoutDetail
      workout={{ ...baseWorkout, plannedWorkoutId: null }}
      viewerMode="athlete"
    />
  ),
};
