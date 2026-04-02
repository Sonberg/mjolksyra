"use client"

import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WorkoutChatPanel } from "./WorkoutChatPanel"

const meta = {
  title: "WorkoutChat/WorkoutChatPanel",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AthleteView: Story = {
  render: () => (
    <WorkoutChatPanel
      traineeId="trainee-1"
      plannedWorkoutId="workout-1"
      viewerMode="athlete"
    />
  ),
}

export const CoachView: Story = {
  render: () => (
    <WorkoutChatPanel
      traineeId="trainee-1"
      plannedWorkoutId="workout-1"
      viewerMode="coach"
    />
  ),
}
