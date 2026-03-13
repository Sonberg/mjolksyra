import { ExerciseSport } from "@/services/exercises/type";

export function exerciseSport(sport: ExerciseSport | string): string {
  switch (sport) {
    case "OlympicWeightlifting":
      return "Olympic Weightlifting";
    default:
      return sport;
  }
}
