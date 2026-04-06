import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutPlanPreview } from "./WorkoutPlanPreview";

const meta = {
  title: "AIPlannerPanel/WorkoutPlanPreview",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const twoWeeksWorkouts = [
  {
    plannedAt: "2026-04-14",
    name: "Squat Day",
    exercises: [
      {
        name: "Squat",
        prescriptionType: "SetsReps",
        sets: [
          { reps: 5, weightKg: 100 },
          { reps: 5, weightKg: 100 },
          { reps: 5, weightKg: 100 },
          { reps: 5, weightKg: 100 },
        ],
      },
      {
        name: "Romanian Deadlift",
        prescriptionType: "SetsReps",
        sets: [
          { reps: 8, weightKg: 80 },
          { reps: 8, weightKg: 80 },
          { reps: 8, weightKg: 80 },
        ],
      },
    ],
  },
  {
    plannedAt: "2026-04-16",
    name: "Bench Day",
    exercises: [
      {
        name: "Bench Press",
        prescriptionType: "SetsReps",
        sets: [
          { reps: 5, weightKg: 80 },
          { reps: 5, weightKg: 80 },
          { reps: 5, weightKg: 80 },
        ],
      },
      {
        name: "Overhead Press",
        prescriptionType: "SetsReps",
        sets: [
          { reps: 8, weightKg: 50 },
          { reps: 8, weightKg: 50 },
        ],
      },
    ],
  },
  {
    plannedAt: "2026-04-18",
    name: "Deadlift Day",
    exercises: [
      {
        name: "Deadlift",
        prescriptionType: "SetsReps",
        sets: [
          { reps: 3, weightKg: 140 },
          { reps: 3, weightKg: 140 },
          { reps: 3, weightKg: 140 },
        ],
      },
    ],
  },
  {
    plannedAt: "2026-04-21",
    name: "Squat Day",
    exercises: [
      {
        name: "Squat",
        prescriptionType: "SetsReps",
        sets: [
          { reps: 5, weightKg: 102.5 },
          { reps: 5, weightKg: 102.5 },
          { reps: 5, weightKg: 102.5 },
          { reps: 5, weightKg: 102.5 },
        ],
      },
    ],
  },
  {
    plannedAt: "2026-04-23",
    name: "Conditioning",
    exercises: [
      {
        name: "Row",
        prescriptionType: "DurationSeconds",
        sets: [
          { durationSeconds: 300 },
          { durationSeconds: 300 },
        ],
      },
    ],
  },
];

export const Default: Story = {
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <WorkoutPlanPreview
        workouts={twoWeeksWorkouts}
        generateCost={5}
        isLoading={false}
        onGenerate={() => {}}
        onRefine={() => {}}
      />
    </div>
  ),
};

export const SingleWeek: Story = {
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <WorkoutPlanPreview
        workouts={twoWeeksWorkouts.slice(0, 3)}
        generateCost={5}
        isLoading={false}
        onGenerate={() => {}}
        onRefine={() => {}}
      />
    </div>
  ),
};

export const EmptyPlan: Story = {
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <WorkoutPlanPreview
        workouts={[]}
        generateCost={5}
        isLoading={false}
        onGenerate={() => {}}
        onRefine={() => {}}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <WorkoutPlanPreview
        workouts={twoWeeksWorkouts}
        generateCost={5}
        isLoading={true}
        onGenerate={() => {}}
        onRefine={() => {}}
      />
    </div>
  ),
};
