import { User } from "@/services/users/type";
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
  invitations: []
};

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
          coach: {
            id: "1",
            givenName: "Per",
            familyName: "Sonberg",
            email: "per@sonberg.com",
            name: "Per Sonberg",
          },
          cost: {
            coach: 900,
            currency: "SEK",
            applicationFee: 100,
            total: 1000,
          },
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
        },
      ]}
      user={{
        ...user,
        onboarding: { coach: "Completed", athlete: "Completed" },
      }}
    />
  ),
};
