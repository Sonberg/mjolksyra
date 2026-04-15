import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlannedWorkoutDetail } from "./PlannedWorkoutDetail";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { ExerciseType } from "@/lib/exercisePrescription";

const meta = {
  title: "WorkoutViewer/PlannedWorkoutDetail",
  component: PlannedWorkoutDetail,
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="mx-auto max-w-4xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof PlannedWorkoutDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const workout: PlannedWorkout = {
  id: "planned-1",
  traineeId: "trainee-1",
  name: "Upper body strength",
  note: "Keep the first bench set smooth and controlled.",
  plannedAt: "2026-04-12",
  createdAt: new Date("2026-04-08T10:00:00.000Z"),
  changes: [],
  appliedBlock: null,
  draftExercises: null,
  publishedExercises: [
    {
      id: "exercise-1",
      exerciseId: "bench",
      name: "Bench Press",
      note: "Pause on chest",
      isPublished: true,
      addedBy: null,
      level: null,
      sports: [],
      prescription: {
        type: ExerciseType.SetsReps,
        sets: [
          {
            target: {
              reps: 5,
              durationSeconds: null,
              distanceMeters: null,
              weightKg: 92.5,
              note: "RPE 7",
            },
          },
        ],
      },
    },
  ],
};

export const CoachView: Story = {
  args: {
    workout,
    viewerMode: "coach",
  },
};

export const AthleteView: Story = {
  args: {
    workout,
    viewerMode: "athlete",
  },
};
