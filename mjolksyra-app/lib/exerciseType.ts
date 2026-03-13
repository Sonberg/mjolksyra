import { ExerciseType } from "@/lib/exercisePrescription";

export function exerciseType(type: ExerciseType | string | null): string | null {
  switch (type) {
    case "SetsReps":
      return "Sets & Reps";
    case "DurationSeconds":
      return "Duration (s)";
    case "DistanceMeters":
      return "Distance (m)";
    default:
      return null;
  }
}
