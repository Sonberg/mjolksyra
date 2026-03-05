import { User } from "@/services/users/type";
import { Trainee } from "@/services/trainees/type";
import { DashboardPageContent } from "./dashboard/pageContent";
import dayjs from "dayjs";

const user: User = {
  id: "1",
  givenName: "Per",
  familyName: "Sonberg",
  athletes: [],
  coaches: [],
  onboarding: {
    athlete: "NotStarted",
    coach: "NotStarted",
  },
  invitations: [],
  isAdmin: false,
};

const onboardedUser: User = {
  ...user,
  onboarding: { coach: "Completed", athlete: "Completed" },
};

const coachUser = {
  id: "c1",
  email: "per@sonberg.com",
  name: "Per Sonberg",
  givenName: "Per",
  familyName: "Sonberg",
};

const makeAthlete = (id: string, name: string, email: string) => ({
  id,
  email,
  name,
  givenName: name.split(" ")[0],
  familyName: name.split(" ")[1] ?? "",
});

const baseTrainee = (id: string, name: string, email: string): Trainee => ({
  id,
  athlete: makeAthlete(id, name, email),
  coach: coachUser,
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
  createdAt: dayjs().subtract(7, "day").toDate(),
  transactions: [],
});

export default {
  NotOnboarded: () => <DashboardPageContent trainees={[]} user={user} />,

  Onboarded: () => (
    <DashboardPageContent
      trainees={[]}
      user={{
        ...user,
        onboarding: { coach: "Completed", athlete: "NotStarted" },
      }}
    />
  ),

  AthleteOnboarded: () => (
    <DashboardPageContent
      trainees={[
        {
          id: "1",
          athlete: {
            id: "1",
            givenName: "Per",
            familyName: "Sonberg",
            email: "per@sonberg.com",
            name: "Per Sonberg",
          },
          coach: coachUser,
          cost: { currency: "SEK", total: 1000 },
          billing: {
            status: "SubscriptionActive",
            hasPrice: true,
            hasSubscription: true,
            lastChargedAt: null,
            nextChargedAt: dayjs().add(1, "month").toDate(),
          },
          nextWorkoutAt: dayjs().add(1, "day").toDate(),
          lastWorkoutAt: dayjs().subtract(1, "day").toDate(),
          createdAt: dayjs().subtract(2, "day").toDate(),
          transactions: [],
        },
      ]}
      user={onboardedUser}
    />
  ),

  WithMixedBillingStates: () => (
    <DashboardPageContent
      trainees={[
        {
          ...baseTrainee("1", "Anna Lindgren", "anna@example.com"),
        },
        {
          ...baseTrainee("2", "Erik Nilsson", "erik@example.com"),
          cost: { currency: "SEK", total: 900 },
          billing: {
            status: "AwaitingAthletePaymentMethod",
            hasPrice: true,
            hasSubscription: false,
            lastChargedAt: null,
            nextChargedAt: null,
          },
        },
        {
          ...baseTrainee("3", "Sara Berg", "sara@example.com"),
          cost: { currency: "SEK", total: 800 },
          billing: {
            status: "AwaitingCoachStripeSetup",
            hasPrice: true,
            hasSubscription: false,
            lastChargedAt: null,
            nextChargedAt: null,
          },
        },
        {
          ...baseTrainee("4", "Mikael Ek", "mikael@example.com"),
          cost: { currency: "SEK", total: 1200 },
          billing: {
            status: "SubscriptionActive",
            hasPrice: true,
            hasSubscription: true,
            lastChargedAt: dayjs().subtract(1, "month").toDate(),
            nextChargedAt: dayjs().add(1, "month").toDate(),
          },
          nextWorkoutAt: dayjs().add(3, "day").toDate(),
          lastWorkoutAt: dayjs().subtract(2, "day").toDate(),
        },
      ]}
      user={onboardedUser}
    />
  ),

  WithActionItems: () => (
    <DashboardPageContent
      trainees={[
        {
          ...baseTrainee("1", "Anna Lindgren", "anna@example.com"),
          cost: { currency: "SEK", total: 1000 },
          billing: {
            status: "SubscriptionActive",
            hasPrice: true,
            hasSubscription: true,
            lastChargedAt: dayjs().subtract(28, "day").toDate(),
            nextChargedAt: dayjs().add(2, "day").toDate(),
          },
          nextWorkoutAt: dayjs().add(1, "day").toDate(),
          lastWorkoutAt: dayjs().subtract(3, "day").toDate(),
          transactions: [
            {
              id: "tx1",
              status: "Succeeded",
              amount: 1000,
              currency: "sek",
              createdAt: dayjs().subtract(1, "month").toDate(),
              receiptUrl: null,
            },
          ],
        },
        {
          ...baseTrainee("2", "Erik Nilsson", "erik@example.com"),
          cost: { currency: "SEK", total: 750 },
          billing: {
            status: "SubscriptionActive",
            hasPrice: true,
            hasSubscription: true,
            lastChargedAt: dayjs().subtract(15, "day").toDate(),
            nextChargedAt: dayjs().add(15, "day").toDate(),
          },
          nextWorkoutAt: dayjs().add(5, "day").toDate(),
          lastWorkoutAt: dayjs().subtract(1, "day").toDate(),
        },
      ]}
      user={onboardedUser}
    />
  ),

  StripeNotConnected: () => (
    <DashboardPageContent
      trainees={[]}
      user={{
        ...user,
        onboarding: { coach: "Started", athlete: "NotStarted" },
      }}
    />
  ),
};
