"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { UserTrainee } from "@/services/users/type"
import { AthleteCoach } from "./AthleteCoach"

const coach: UserTrainee = {
  traineeId: "t1",
  givenName: "Per",
  familyName: "Sonberg",
  status: "Active",
}

const meta = {
  title: "Athlete/AthleteCoach",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Selected: Story = {
  render: () => (
    <AthleteCoach
      coach={coach}
      isSelected={true}
      href="/app/athlete/coaches/t1"
      onSelect={() => {}}
    />
  ),
}

export const NotSelected: Story = {
  render: () => (
    <AthleteCoach
      coach={coach}
      isSelected={false}
      href="/app/athlete/coaches/t1"
      onSelect={() => {}}
    />
  ),
}
