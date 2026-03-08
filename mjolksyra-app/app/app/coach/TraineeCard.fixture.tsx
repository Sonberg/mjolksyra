import { Trainee } from "@/services/trainees/type";
import { TraineeCard } from "./TraineeCard";
import dayjs from "dayjs";

const baseAthlete = {
  id: "a1",
  email: "anna@example.com",
  name: "Anna Lindgren",
  givenName: "Anna",
  familyName: "Lindgren",
};

const baseCoach = {
  id: "c1",
  email: "per@sonberg.com",
  name: "Per Sonberg",
  givenName: "Per",
  familyName: "Sonberg",
};

const baseBilling = {
  status: "PriceNotSet" as const,
  hasPrice: false,
  hasSubscription: false,
  lastChargedAt: null,
  nextChargedAt: null,
};

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
};

const activeBilling = {
  status: "SubscriptionActive" as const,
  hasPrice: true,
  hasSubscription: true,
  lastChargedAt: dayjs().subtract(1, "month").toDate(),
  nextChargedAt: dayjs().add(1, "month").toDate(),
};

export default {
  PriceNotSet: () => <TraineeCard trainee={baseTrainee} />,

  PriceSet: () => (
    <TraineeCard
      trainee={{
        ...baseTrainee,
        cost: { currency: "SEK", total: 1000 },
        billing: { ...baseBilling, status: "PriceSet", hasPrice: true },
      }}
    />
  ),

  AwaitingAthletePaymentMethod: () => (
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

  AwaitingCoachStripeSetup: () => (
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

  SubscriptionActive: () => (
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

  WithUnpublishedChanges: () => (
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

  PaymentFailed: () => (
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

  WithTransactions: () => (
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
};
