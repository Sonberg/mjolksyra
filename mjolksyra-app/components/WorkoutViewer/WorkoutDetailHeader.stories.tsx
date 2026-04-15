import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutDetailHeader } from "./WorkoutDetailHeader";

const noop = () => {};

const meta = {
  title: "WorkoutViewer/WorkoutDetailHeader",
  component: WorkoutDetailHeader,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-4xl border border-[var(--shell-border)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkoutDetailHeader>;

export default meta;
type Story = StoryObj<typeof WorkoutDetailHeader>;

export const InProgress: Story = {
  args: {
    displayName: "Sunday, 15 Mar 2026",
    isCompleted: false,
    createdAt: new Date("2026-03-15T10:00:00"),
    completedAt: null,
    plannedWorkoutId: "plan-1",
    viewerMode: "athlete",
    isEditMode: false,
    onToggleEditMode: noop,
    onRestoreToPlanned: noop,
    onToggleCompletion: noop,
    onOpenChat: noop,
  },
};

export const InProgressEditMode: Story = {
  args: {
    displayName: "Sunday, 15 Mar 2026",
    isCompleted: false,
    createdAt: new Date("2026-03-15T10:00:00"),
    completedAt: null,
    plannedWorkoutId: "plan-1",
    viewerMode: "athlete",
    isEditMode: true,
    onToggleEditMode: noop,
    onRestoreToPlanned: noop,
    onToggleCompletion: noop,
    onOpenChat: noop,
  },
};

export const Completed: Story = {
  args: {
    displayName: "Saturday, 14 Mar 2026",
    isCompleted: true,
    createdAt: new Date("2026-03-14T08:30:00"),
    completedAt: new Date("2026-03-14T09:45:00"),
    plannedWorkoutId: "plan-2",
    viewerMode: "athlete",
    isEditMode: false,
    onToggleEditMode: noop,
    onRestoreToPlanned: noop,
    onToggleCompletion: noop,
    onOpenChat: noop,
  },
};

export const CoachView: Story = {
  args: {
    displayName: "Friday, 13 Mar 2026",
    isCompleted: true,
    createdAt: new Date("2026-03-13T14:00:00"),
    completedAt: new Date("2026-03-13T15:30:00"),
    plannedWorkoutId: "plan-3",
    viewerMode: "coach",
    isEditMode: false,
    onToggleEditMode: noop,
    onRestoreToPlanned: noop,
    onToggleCompletion: noop,
    onOpenChat: noop,
  },
};

export const AdHocInProgress: Story = {
  args: {
    displayName: "Today",
    isCompleted: false,
    createdAt: new Date("2026-04-10T18:00:00"),
    completedAt: null,
    plannedWorkoutId: null,
    viewerMode: "athlete",
    isEditMode: false,
    onToggleEditMode: noop,
    onRestoreToPlanned: noop,
    onToggleCompletion: noop,
    onOpenChat: noop,
  },
};

export const NarrowAthleteView: Story = {
  args: {
    displayName: "Tomorrow",
    isCompleted: false,
    createdAt: new Date("2026-04-11T21:42:24"),
    completedAt: null,
    plannedWorkoutId: "plan-mobile",
    viewerMode: "athlete",
    isEditMode: false,
    onToggleEditMode: noop,
    onRestoreToPlanned: noop,
    onToggleCompletion: noop,
    onOpenChat: noop,
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-[360px] border border-[var(--shell-border)]">
        <Story />
      </div>
    ),
  ],
};
