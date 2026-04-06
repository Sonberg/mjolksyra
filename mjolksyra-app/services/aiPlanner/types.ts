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
  sessionId: string;
  message: string;
  isReadyToGenerate: boolean;
  options: string[];
  suggestedParams: ClarifyWorkoutPlanSuggestedParams | null;
};

export type LatestAIPlannerSessionMessage = {
  role: "user" | "assistant";
  content: string;
  options: string[];
};

export type LatestAIPlannerSessionResponse = {
  sessionId: string;
  description: string;
  conversationHistory: LatestAIPlannerSessionMessage[];
  suggestedParams: ClarifyWorkoutPlanSuggestedParams | null;
  generationResult: GenerateWorkoutPlanResponse | null;
};

export type GenerateWorkoutPlanResponse = {
  workoutsCreated: number;
  summary: string;
  dateFrom: string;
  dateTo: string;
};
