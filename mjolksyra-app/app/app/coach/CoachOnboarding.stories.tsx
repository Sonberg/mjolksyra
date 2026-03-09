import type { Meta, StoryObj } from "@storybook/react"
import { CoachOnboarding } from "./CoachOnboarding"
import { User } from "@/services/users/type"

const baseUser: User = {
  id: "u1",
  givenName: "Per",
  familyName: "Sonberg",
  athletes: [],
  coaches: [],
  invitations: [],
  onboarding: {
    athlete: "NotStarted",
    coach: "NotStarted",
    coachTrialEndsAt: null,
    coachPlanId: null,
  },
  discount: null,
  isAdmin: false,
}

const meta = {
  title: "Coach/CoachOnboarding",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const NotStarted: Story = {
  render: () => (
    <CoachOnboarding user={{ ...baseUser, onboarding: { ...baseUser.onboarding, coach: "NotStarted" } }} />
  ),
}

export const Started: Story = {
  render: () => (
    <CoachOnboarding user={{ ...baseUser, onboarding: { ...baseUser.onboarding, coach: "Started" } }} />
  ),
}

export const Completed: Story = {
  render: () => (
    <CoachOnboarding user={{ ...baseUser, onboarding: { ...baseUser.onboarding, coach: "Completed" } }} />
  ),
}
