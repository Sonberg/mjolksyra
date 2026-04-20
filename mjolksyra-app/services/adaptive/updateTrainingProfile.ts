import { ApiClient } from "../client";

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";
export type IntensityMethod = "Weight" | "Rpe" | "Rir";
export type RepStyle = "Regular" | "Paused" | "Eccentric" | "Mixed";
export type ExerciseSport =
  | "Powerlifting"
  | "Strongman"
  | "OlympicWeightlifting"
  | "Bodybuilding"
  | "Crossfit"
  | "Hyrox"
  | "Calisthenics"
  | "Functional";

export type TrainingProfile = {
  experienceLevel: ExperienceLevel;
  intensityMethod: IntensityMethod;
  preferredRepStyle: RepStyle;
  workoutsPerWeek: number;
  goalSport: ExerciseSport;
  goals: string[];
  competitionDate?: string;
  coachNotes?: string;
};

type Args = {
  accessToken: string;
  profile: TrainingProfile;
};

export async function updateTrainingProfile({ accessToken, profile }: Args) {
  await ApiClient.put("/api/onboarding/training-profile", profile, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
