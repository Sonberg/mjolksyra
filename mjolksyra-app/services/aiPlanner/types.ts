export type PlannerFileContent = {
  name: string;
  type: string;
  content: string;
};

export type PlannerConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ClarifyWorkoutPlanSuggestedParams = {
  startDate: string;
  numberOfWeeks: number;
  conflictStrategy: "Skip" | "Replace" | "Append";
};

export type ClarifyWorkoutPlanResponse = {
  sessionId: string;
  message: string;
  isReadyToGenerate: boolean;
  workoutsChanged: boolean;
  options: string[];
  suggestedParams: ClarifyWorkoutPlanSuggestedParams | null;
};

export type LatestPlannerSessionMessage = {
  role: "user" | "assistant";
  content: string;
  options: string[];
};

export type LatestPlannerSessionResponse = {
  sessionId: string;
  description: string;
  conversationHistory: LatestPlannerSessionMessage[];
  suggestedParams: ClarifyWorkoutPlanSuggestedParams | null;
  generationResult: GenerateWorkoutPlanResponse | null;
};

export type GenerateWorkoutPlanResponse = {
  workoutsCreated: number;
  summary: string;
  dateFrom: string;
  dateTo: string;
};

export type PreviewWorkoutPlanSet = {
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  note?: string;
};

export type PreviewWorkoutPlanExercise = {
  name: string;
  note?: string;
  prescriptionType?: string;
  sets: PreviewWorkoutPlanSet[];
};

export type PreviewWorkoutPlanWorkout = {
  plannedAt: string;
  name?: string;
  note?: string;
  exercises: PreviewWorkoutPlanExercise[];
};

export type PreviewWorkoutPlanResponse = {
  workouts: PreviewWorkoutPlanWorkout[];
};
