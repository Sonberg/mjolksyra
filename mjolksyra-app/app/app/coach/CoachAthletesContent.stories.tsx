import type { Meta, StoryObj } from "@storybook/react"
import { Trainee } from "@/services/trainees/type"
import { CoachAthletesContent } from "./CoachAthletesContent"
import dayjs from "dayjs"

const baseAthlete = (id: string) => ({
  id,
  email: `athlete${id}@example.com`,
  name: `Athlete ${id}`,
  givenName: "Athlete",
  familyName: id,
})

const baseCoach = {
  id: "c1",
  email: "per@sonberg.com",
  name: "Per Sonberg",
  givenName: "Per",
  familyName: "Sonberg",
}

const baseBilling = {
  status: "PriceNotSet" as const,
  hasPrice: false,
  hasSubscription: false,
  lastChargedAt: null,
  nextChargedAt: null,
}

const baseTrainee = (id: string): Trainee => ({
  id,
  athlete: baseAthlete(id),
  coach: baseCoach,
  cost: null,
  billing: baseBilling,
  nextWorkoutAt: null,
  lastWorkoutAt: null,
  createdAt: dayjs().subtract(7, "day").toDate(),
  transactions: [],
})

const meta = {
  title: "Coach/CoachAthletesContent",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const NoAthletes: Story = {
  render: () => <CoachAthletesContent trainees={[]} />,
}

export const WithAthletes: Story = {
  render: () => (
    <CoachAthletesContent
      trainees={[
        {
          ...baseTrainee("1"),
          cost: { currency: "SEK", total: 1000 },
          billing: {
            status: "SubscriptionActive",
            hasPrice: true,
            hasSubscription: true,
            lastChargedAt: dayjs().subtract(1, "month").toDate(),
            nextChargedAt: dayjs().add(1, "month").toDate(),
          },
          nextWorkoutAt: dayjs().add(2, "day").toDate(),
          lastWorkoutAt: dayjs().subtract(1, "day").toDate(),
        },
        {
          ...baseTrainee("2"),
          cost: { currency: "SEK", total: 800 },
          billing: {
            ...baseBilling,
            status: "AwaitingAthletePaymentMethod",
            hasPrice: true,
          },
        },
        {
          ...baseTrainee("3"),
        },
      ]}
    />
  ),
}

export const AthleteOverage: Story = {
  render: () => (
    <CoachAthletesContent
      trainees={Array.from({ length: 12 }, (_, i) => baseTrainee(`${i + 1}`))}
    />
  ),
}
