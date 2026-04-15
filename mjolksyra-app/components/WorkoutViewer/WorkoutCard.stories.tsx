import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkoutCard } from "./WorkoutCard";
import type { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { ExerciseType } from "@/lib/exercisePrescription";

const meta = {
  title: "WorkoutViewer/WorkoutCard",
  component: WorkoutCard,
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="mx-auto max-w-3xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof WorkoutCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseWorkout: PlannedWorkout = {
  id: "planned-1",
  traineeId: "trainee-1",
  name: "Lower body strength",
  note: "Keep rest times honest and move smoothly through the warm-up sets.",
  plannedAt: "2026-04-12",
  skippedAt: null,
  hasActiveSession: false,
  createdAt: new Date("2026-04-08T10:00:00.000Z"),
  changes: [],
  appliedBlock: null,
  draftExercises: null,
  publishedExercises: [
    {
      id: "exercise-1",
      exerciseId: "squat",
      name: "Back Squat",
      note: null,
      isPublished: true,
      isDone: false,
      addedBy: null,
      level: null,
      sport: null,
      prescription: {
        type: ExerciseType.SetsReps,
        sets: [
          {
            target: {
              reps: 5,
              durationSeconds: null,
              distanceMeters: null,
              weightKg: 140,
              note: "RPE 7",
            },
            actual: null,
          },
        ],
      },
    },
  ],
};

export const AthletePlanned: Story = {
  args: {
    workout: baseWorkout,
    viewerMode: "athlete",
    traineeId: "trainee-1",
    backTab: "planned",
  },
};

export const AthleteStarted: Story = {
  args: {
    workout: {
      ...baseWorkout,
      id: "planned-2",
      hasActiveSession: true,
    },
    viewerMode: "athlete",
    traineeId: "trainee-1",
    backTab: "planned",
  },
};

