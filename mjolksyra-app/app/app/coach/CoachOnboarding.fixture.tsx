import { CoachOnboarding } from "./CoachOnboarding";
import { User } from "@/services/users/type";

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
};

export default {
  NotStarted: () => (
    <CoachOnboarding user={{ ...baseUser, onboarding: { ...baseUser.onboarding, coach: "NotStarted" } }} />
  ),

  Started: () => (
    <CoachOnboarding user={{ ...baseUser, onboarding: { ...baseUser.onboarding, coach: "Started" } }} />
  ),

  Completed: () => (
    <CoachOnboarding user={{ ...baseUser, onboarding: { ...baseUser.onboarding, coach: "Completed" } }} />
  ),
};
