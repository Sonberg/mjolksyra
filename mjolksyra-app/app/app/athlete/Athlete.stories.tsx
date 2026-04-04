import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { User } from "@/services/users/type"
import { PageContent } from "./pageContent"

const user: User = {
  id: "1",
  givenName: "Per",
  familyName: "Sonberg",
  athletes: [],
  coaches: [],
  invitations: [],
  onboarding: {
    athlete: "NotStarted",
    coach: "NotStarted",
  },
  isAdmin: false,
}

const meta = {
  title: "Athlete/Athlete",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const NotOnboarded: Story = {
  render: () => <PageContent user={user} />,
}

export const Onboarded: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "Completed", coach: "NotStarted" },
      }}
    />
  ),
}

export const WithActiveCoach: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "Completed", coach: "NotStarted" },
        coaches: [
          {
            traineeId: "1",
            givenName: "John",
            familyName: "Doe",
            status: "Active",
          },
          {
            traineeId: "2",
            givenName: "Jane",
            familyName: "Smith",
            status: "Active",
          },
        ],
      }}
    />
  ),
}

export const WithMixedCoaches: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "Completed", coach: "NotStarted" },
        coaches: [
          {
            traineeId: "1",
            givenName: "John",
            familyName: "Doe",
            status: "Active",
          },
          {
            traineeId: "2",
            givenName: "Jane",
            familyName: "Smith",
            status: "PendingInvitation",
          },
        ],
      }}
    />
  ),
}

export const WithWorkouts: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "Completed", coach: "NotStarted" },
        coaches: [
          {
            traineeId: "1",
            givenName: "John",
            familyName: "Doe",
            status: "Active",
          },
        ],
      }}
    />
  ),
}

export const CompleteProfile: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "Completed", coach: "Completed" },
        coaches: [
          {
            traineeId: "1",
            givenName: "John",
            familyName: "Doe",
            status: "Active",
          },
        ],
      }}
    />
  ),
}

export const OnboardingStarted: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "Started", coach: "NotStarted" },
      }}
    />
  ),
}

export const WithPaymentFailed: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "Completed", coach: "NotStarted" },
        coaches: [
          {
            traineeId: "1",
            givenName: "John",
            familyName: "Doe",
            status: "Active",
          },
        ],
      }}
    />
  ),
}

export const PendingInvitationsOnly: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "NotStarted", coach: "NotStarted" },
        coaches: [
          {
            traineeId: "1",
            givenName: "John",
            familyName: "Doe",
            status: "PendingInvitation",
          },
          {
            traineeId: "2",
            givenName: "Maria",
            familyName: "Karlsson",
            status: "PendingInvitation",
          },
        ],
      }}
    />
  ),
}

export const StripeSetupNotStartedHasInvite: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "NotStarted", coach: "NotStarted" },
        coaches: [],
        invitations: [
          {
            id: "inv-1",
            givenName: "Alex",
            familyName: "Coach",
            createdAt: new Date("2026-03-12T10:00:00Z"),
          },
        ],
      }}
    />
  ),
}

export const StripeSetupNotStartedAcceptedCoachInvite: Story = {
  render: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "NotStarted", coach: "NotStarted" },
        invitations: [],
        coaches: [
          {
            traineeId: "1",
            givenName: "Alex",
            familyName: "Coach",
            status: "Active",
          },
        ],
      }}
    />
  ),
}
