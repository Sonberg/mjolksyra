import type { Meta, StoryObj } from "@storybook/react"
import { Trainee } from "@/services/trainees/type"
import { TraineeCard } from "./TraineeCard"
import dayjs from "dayjs"

const baseAthlete = {
  id: "a1",
  email: "anna@example.com",
  name: "Anna Lindgren",
  givenName: "Anna",
  familyName: "Lindgren",
}

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

const baseTrainee: Trainee = {
  id: "t1",
  athlete: baseAthlete,
  coach: baseCoach,
  cost: null,
  billing: baseBilling,
  nextWorkoutAt: null,
  lastWorkoutAt: null,
  createdAt: dayjs().subtract(7, "day").toDate(),
  transactions: [],
}

const activeBilling = {
  status: "SubscriptionActive" as const,
  hasPrice: true,
  hasSubscription: true,
  lastChargedAt: dayjs().subtract(1, "month").toDate(),
  nextChargedAt: dayjs().add(1, "month").toDate(),
}

const meta = {
  title: "Coach/TraineeCard",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const PriceNotSet: Story = {
  render: () => <TraineeCard trainee={baseTrainee} />,
}

export const PriceSet: Story = {
  render: () => (
    <TraineeCard
      trainee={{
        ...baseTrainee,
        cost: { currency: "SEK", total: 1000 },
        billing: { ...baseBilling, status: "PriceSet", hasPrice: true },
      }}
    />
  ),
}

export const AwaitingAthletePaymentMethod: Story = {
  render: () => (
    <TraineeCard
      trainee={{
        ...baseTrainee,
        cost: { currency: "SEK", total: 1000 },
        billing: {
          ...baseBilling,
          status: "AwaitingAthletePaymentMethod",
          hasPrice: true,
        },
      }}
    />
  ),
}

export const AwaitingCoachStripeSetup: Story = {
  render: () => (
    <TraineeCard
      trainee={{
        ...baseTrainee,
        cost: { currency: "SEK", total: 1000 },
        billing: {
          ...baseBilling,
          status: "AwaitingCoachStripeSetup",
          hasPrice: true,
        },
      }}
    />
  ),
}

export const SubscriptionActive: Story = {
  render: () => (
    <TraineeCard
      trainee={{
        ...baseTrainee,
        cost: { currency: "SEK", total: 1000 },
        billing: activeBilling,
        nextWorkoutAt: dayjs().add(2, "day").toDate(),
        lastWorkoutAt: dayjs().subtract(1, "day").toDate(),
      }}
    />
  ),
}

export const WithUnpublishedChanges: Story = {
  render: () => (
    <TraineeCard
      trainee={{
        ...baseTrainee,
        cost: { currency: "SEK", total: 1000 },
        billing: activeBilling,
        nextWorkoutAt: dayjs().add(2, "day").toDate(),
        lastWorkoutAt: dayjs().subtract(1, "day").toDate(),
      }}
      hasUnpublishedChanges
    />
  ),
}

export const PaymentFailed: Story = {
  render: () => (
    <TraineeCard
      trainee={{
        ...baseTrainee,
        cost: { currency: "SEK", total: 1000 },
        billing: {
          status: "PaymentFailed",
          hasPrice: true,
          hasSubscription: true,
          lastChargedAt: dayjs().subtract(2, "month").toDate(),
          nextChargedAt: null,
        },
      }}
    />
  ),
}

export const WithTransactions: Story = {
  render: () => (
    <TraineeCard
      trainee={{
        ...baseTrainee,
        cost: { currency: "SEK", total: 1000 },
        billing: activeBilling,
        nextWorkoutAt: dayjs().add(2, "day").toDate(),
        lastWorkoutAt: dayjs().subtract(1, "day").toDate(),
        transactions: [
          {
            id: "tx1",
            status: "Succeeded",
            amount: 1000,
            currency: "sek",
            createdAt: dayjs().subtract(1, "month").toDate(),
            receiptUrl: null,
          },
          {
            id: "tx2",
            status: "Failed",
            amount: 1000,
            currency: "sek",
            createdAt: dayjs().subtract(2, "month").toDate(),
            receiptUrl: null,
          },
          {
            id: "tx3",
            status: "Refunded",
            amount: 1000,
            currency: "sek",
            createdAt: dayjs().subtract(3, "month").toDate(),
            receiptUrl: null,
          },
        ],
      }}
    />
  ),
}
