import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutDetail } from "./WorkoutDetail";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { ExerciseType } from "@/lib/exercisePrescription";
import { PropsWithChildren } from "react";

const StoryProvider = ({ children }: PropsWithChildren) => (
  <div className="max-w-4xl mx-auto">{children}</div>
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

const baseWorkout: PlannedWorkout = {
  id: "workout-1",
  traineeId: "trainee-1",
  name: "Lower Body Strength",
  note: "Keep rest around 2 minutes and lock in your squat depth.",
  plannedAt: "2026-04-02",
  completedAt: new Date("2026-04-02T11:15:00Z"),
  reviewedAt: null,
  media: [],
  createdAt: new Date("2026-04-01"),
  appliedBlock: null,
  exercises: [
    {
      id: "exercise-1",
      exerciseId: "squat",
      name: "Back Squat",
      note: null,
      isDone: true,
      isPublished: true,
      addedBy: null,
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
            actual: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 70, note: null, isDone: true },
          },
          {
            target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 70, note: null },
            actual: null,
          },
        ],
      },
    },
  ],
};

export const CoachView: Story = {
  render: () => (
    <WorkoutDetail
      workout={baseWorkout}
      viewerMode="coach"
      traineeId="trainee-1"
      backTab="changes"
    />
  ),
};

export const AthleteView: Story = {
  render: () => (
    <WorkoutDetail
      workout={baseWorkout}
      viewerMode="athlete"
      traineeId="trainee-1"
      backTab="past"
    />
  ),
};

export const AthleteWithOwnExercise: Story = {
  render: () => (
    <WorkoutDetail
      workout={{
        ...baseWorkout,
        completedAt: null,
        exercises: [
          baseWorkout.exercises[0], // coach-added: no delete/add-set controls
          {
            id: "exercise-athlete-1",
            exerciseId: "pushup",
            name: "Push-up",
            note: null,
            isDone: false,
            isPublished: true,
            addedBy: "Athlete",
            prescription: {
              type: ExerciseType.SetsReps,
              sets: [
                { target: null, actual: null },
                { target: null, actual: null },
              ],
            },
          },
        ],
      }}
      viewerMode="athlete"
      traineeId="trainee-1"
    />
  ),
};

export const AthleteEmptySession: Story = {
  render: () => (
    <WorkoutDetail
      workout={{
        ...baseWorkout,
        id: "workout-empty",
        name: null,
        note: null,
        completedAt: null,
        exercises: [],
        plannedAt: "2026-04-10",
      }}
      viewerMode="athlete"
      traineeId="trainee-1"
    />
  ),
};
  