import { NextResponse } from "next/server";

const DEMO_EXERCISES = [
  { id: "demo-01", name: "Bench Press", sports: ["Powerlifting", "Bodybuilding"], level: "Intermediate", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-02", name: "Incline Dumbbell Press", sports: ["Bodybuilding"], level: "Beginner", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-03", name: "Paused Back Squat", sports: ["Powerlifting"], level: "Expert", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-04", name: "Front Squat", sports: ["OlympicWeightlifting", "Crossfit"], level: "Intermediate", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-05", name: "Romanian Deadlift", sports: ["Powerlifting", "Bodybuilding"], level: "Intermediate", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-06", name: "Conventional Deadlift", sports: ["Powerlifting", "Strongman"], level: "Intermediate", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-07", name: "Pull Ups", sports: ["Calisthenics", "Crossfit"], level: "Beginner", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-08", name: "Chest-Supported Row", sports: ["Bodybuilding"], level: "Beginner", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-09", name: "Barbell Overhead Press", sports: ["Powerlifting", "Strongman"], level: "Intermediate", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-10", name: "Single-Arm Dumbbell Row", sports: ["Bodybuilding"], level: "Beginner", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-11", name: "Bulgarian Split Squat", sports: ["Bodybuilding", "Functional"], level: "Intermediate", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-12", name: "Walking Lunges", sports: ["Functional", "Crossfit"], level: "Beginner", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-13", name: "Leg Press", sports: ["Bodybuilding"], level: "Beginner", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-14", name: "Seated Hamstring Curl", sports: ["Bodybuilding"], level: "Beginner", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-15", name: "Cable Triceps Extension", sports: ["Bodybuilding"], level: "Beginner", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-16", name: "Biceps Curl", sports: ["Bodybuilding"], level: "Beginner", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-17", name: "Hanging Leg Raise", sports: ["Calisthenics"], level: "Intermediate", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-18", name: "Plank Hold", sports: ["Functional", "Calisthenics"], level: "Beginner", type: "DurationSeconds", starred: false, canDelete: false },
  { id: "demo-19", name: "Bike Sprint", sports: ["Hyrox", "Crossfit"], level: "Intermediate", type: "DurationSeconds", starred: false, canDelete: false },
  { id: "demo-20", name: "Row Erg", sports: ["Hyrox", "Crossfit"], level: "Beginner", type: "DistanceMeters", starred: false, canDelete: false },
  { id: "demo-21", name: "Easy Run", sports: ["Hyrox", "Functional"], level: "Beginner", type: "DurationSeconds", starred: false, canDelete: false },
  { id: "demo-22", name: "Tempo Run", sports: ["Hyrox"], level: "Intermediate", type: "DistanceMeters", starred: false, canDelete: false },
  { id: "demo-23", name: "Interval Run 8 x 400m", sports: ["Hyrox", "Crossfit"], level: "Expert", type: "DistanceMeters", starred: false, canDelete: false },
  { id: "demo-24", name: "Assault Bike", sports: ["Crossfit", "Hyrox"], level: "Intermediate", type: "DurationSeconds", starred: false, canDelete: false },
  { id: "demo-25", name: "SkiErg", sports: ["Hyrox"], level: "Intermediate", type: "DistanceMeters", starred: false, canDelete: false },
  { id: "demo-26", name: "Jump Rope", sports: ["Crossfit", "Functional"], level: "Beginner", type: "DurationSeconds", starred: false, canDelete: false },
  { id: "demo-27", name: "Clean and Jerk", sports: ["OlympicWeightlifting", "Crossfit"], level: "Expert", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-28", name: "Snatch", sports: ["OlympicWeightlifting", "Crossfit"], level: "Expert", type: "SetsReps", starred: false, canDelete: false },
  { id: "demo-29", name: "Farmer's Carry", sports: ["Strongman", "Functional"], level: "Intermediate", type: "DistanceMeters", starred: false, canDelete: false },
  { id: "demo-30", name: "Hip Mobility Flow", sports: ["Functional"], level: "Beginner", type: "DurationSeconds", starred: false, canDelete: false },
];

export async function GET() {
  return NextResponse.json({ data: DEMO_EXERCISES, next: null });
}
