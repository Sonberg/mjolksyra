"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AthleteTransactions } from "./AthleteTransactions"
import { Trainee } from "@/services/trainees/type"
import dayjs from "dayjs"

const coach = {
  traineeId: "t1",
  givenName: "Per",
  familyName: "Sonberg",
  status: "Active" as const,
}

const baseTrainee: Trainee = {
  id: "t1",
  athlete: {
    id: "a1",
    email: "anna@example.com",
    name: "Anna Lindgren",
    givenName: "Anna",
    familyName: "Lindgren",
  },
  coach: {
    id: "c1",
    email: "per@sonberg.com",
    name: "Per Sonberg",
    givenName: "Per",
    familyName: "Sonberg",
  },
  cost: null,
  billing: {
    status: "PriceNotSet",
    hasPrice: false,
    hasSubscription: false,
    lastChargedAt: null,
    nextChargedAt: null,
  },
  nextWorkoutAt: null,
  lastWorkoutAt: null,
  createdAt: dayjs().subtract(30, "day").toDate(),
  transactions: [],
}

function Wrapper({ trainee, children }: { trainee: Trainee; children: React.ReactNode }) {
  const queryClient = useQueryClient()
  useEffect(() => {
    queryClient.setQueryData(["trainees", trainee.id], trainee)
  }, [queryClient, trainee])
  return <>{children}</>
}

const meta = {
  title: "Athlete/AthleteTransactions",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const PriceNotSet: Story = {
  render: () => (
    <Wrapper trainee={baseTrainee}>
      <AthleteTransactions coach={coach} />
    </Wrapper>
  ),
}

export const AwaitingAthletePaymentMethod: Story = {
  render: () => {
    const trainee: Trainee = {
      ...baseTrainee,
      cost: { currency: "SEK", total: 1000 },
      billing: { ...baseTrainee.billing, status: "AwaitingAthletePaymentMethod", hasPrice: true },
    }
    return (
      <Wrapper trainee={trainee}>
        <AthleteTransactions coach={coach} />
      </Wrapper>
    )
  },
}

export const AwaitingCoachStripeSetup: Story = {
  render: () => {
    const trainee: Trainee = {
      ...baseTrainee,
      cost: { currency: "SEK", total: 1000 },
      billing: { ...baseTrainee.billing, status: "AwaitingCoachStripeSetup", hasPrice: true },
    }
    return (
      <Wrapper trainee={trainee}>
        <AthleteTransactions coach={coach} />
      </Wrapper>
    )
  },
}

export const PriceSet: Story = {
  render: () => {
    const trainee: Trainee = {
      ...baseTrainee,
      cost: { currency: "SEK", total: 1000 },
      billing: { ...baseTrainee.billing, status: "PriceSet", hasPrice: true },
    }
    return (
      <Wrapper trainee={trainee}>
        <AthleteTransactions coach={coach} />
      </Wrapper>
    )
  },
}

export const SubscriptionActive: Story = {
  render: () => {
    const trainee: Trainee = {
      ...baseTrainee,
      cost: { currency: "SEK", total: 1000 },
      billing: {
        status: "SubscriptionActive",
        hasPrice: true,
        hasSubscription: true,
        lastChargedAt: dayjs().subtract(1, "month").toDate(),
        nextChargedAt: dayjs().add(1, "month").toDate(),
      },
    }
    return (
      <Wrapper trainee={trainee}>
        <AthleteTransactions coach={coach} />
      </Wrapper>
    )
  },
}

export const PaymentFailed: Story = {
  render: () => {
    const trainee: Trainee = {
      ...baseTrainee,
      cost: { currency: "SEK", total: 1000 },
      billing: {
        status: "PaymentFailed",
        hasPrice: true,
        hasSubscription: true,
        lastChargedAt: dayjs().subtract(2, "month").toDate(),
        nextChargedAt: null,
      },
    }
    return (
      <Wrapper trainee={trainee}>
        <AthleteTransactions coach={coach} />
      </Wrapper>
    )
  },
}

export const WithTransactions: Story = {
  render: () => {
    const trainee: Trainee = {
      ...baseTrainee,
      cost: { currency: "SEK", total: 1000 },
      billing: {
        status: "SubscriptionActive",
        hasPrice: true,
        hasSubscription: true,
        lastChargedAt: dayjs().subtract(1, "month").toDate(),
        nextChargedAt: dayjs().add(1, "month").toDate(),
      },
      transactions: [
        {
          id: "tx1",
          status: "Succeeded",
          amount: 1000,
          currency: "sek",
          createdAt: dayjs().subtract(1, "month").toDate(),
          receiptUrl: "https://pay.stripe.com/receipts/example",
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
    }
    return (
      <Wrapper trainee={trainee}>
        <AthleteTransactions coach={coach} />
      </Wrapper>
    )
  },
}
