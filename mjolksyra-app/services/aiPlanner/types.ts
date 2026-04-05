export type AIPlannerFileContent = {
  name: string;
  type: string;
  content: string;
};

export type AIPlannerConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ClarifyWorkoutPlanSuggestedParams = {
  startDate: string;
  numberOfWeeks: number;
  conflictStrategy: "Skip" | "Replace" | "Append";
};

export type ClarifyWorkoutPlanResponse = {
  message: string;
  isReadyToGenerate: boolean;
  suggestedParams: ClarifyWorkoutPlanSuggestedParams | null;
};

export type GenerateWorkoutPlanResponse = {
  workoutsCreated: number;
  summary: string;
  dateFrom: string;
  dateTo: string;
};
