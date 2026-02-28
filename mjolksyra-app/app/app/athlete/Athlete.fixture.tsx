import { User } from "@/services/users/type";
import { PageContent } from "./pageContent";

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
};

export default {
  NotOnboarded: () => <PageContent user={user} />,

  Onboarded: () => (
    <PageContent
      user={{
        ...user,
        onboarding: { athlete: "Completed", coach: "NotStarted" },
      }}
    />
  ),

  WithActiveCoach: () => (
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

  WithMixedCoaches: () => (
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

  WithWorkouts: () => (
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
        // Note: Workouts will be handled by AthleteWorkouts component
      }}
    />
  ),

  CompleteProfile: () => (
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
};
