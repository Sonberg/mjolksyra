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
  isReadyToApply: boolean;
  requiresApproval: boolean;
  options: string[];
  suggestedParams: ClarifyWorkoutPlanSuggestedParams | null;
  proposedActionSet: AIPlannerActionSet | null;
  previewWorkouts: PreviewWorkoutPlanWorkout[];
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
  proposedActionSet: AIPlannerActionSet | null;
  previewWorkouts: PreviewWorkoutPlanWorkout[];
  generationResult: AIPlannerApplyProposalResponse | null;
};

export type GenerateWorkoutPlanResponse = {
  workoutsCreated: number;
  summary: string;
  dateFrom: string;
  dateTo: string;
};

export type AIPlannerActionType =
  | "create_workout"
  | "update_workout"
  | "move_workout"
  | "delete_workout"
  | "add_exercise"
  | "update_exercise"
  | "delete_exercise";

export type AIPlannerExerciseDraft = {
  id?: string | null;
  exerciseId?: string | null;
  name: string;
  note?: string | null;
  prescriptionType?: string | null;
  sets: PreviewWorkoutPlanSet[];
};

export type AIPlannerWorkoutDraft = {
  name?: string | null;
  note?: string | null;
  plannedAt: string;
  exercises: AIPlannerExerciseDraft[];
};

export type AIPlannerActionProposal = {
  actionType: AIPlannerActionType;
  summary: string;
  targetWorkoutId?: string | null;
  targetExerciseId?: string | null;
  targetDate?: string | null;
  previousDate?: string | null;
  workout?: AIPlannerWorkoutDraft | null;
};

export type AIPlannerCreditBreakdownItem = {
  actionType: AIPlannerActionType;
  count: number;
  unitCost: number;
  subtotal: number;
};

export type AIPlannerActionSet = {
  id: string;
  status: "pending" | "applied" | "discarded" | "superseded";
  summary: string;
  explanation?: string | null;
  affectedDateFrom?: string | null;
  affectedDateTo?: string | null;
  sourceSnapshotHash?: string | null;
  createdAt: string;
  appliedAt?: string | null;
  creditCost: number;
  creditBreakdown: AIPlannerCreditBreakdownItem[];
  actions: AIPlannerActionProposal[];
};

export type AIPlannerApplyProposalResponse = {
  sessionId: string;
  proposalId: string;
  actionsApplied: number;
  summary: string;
  workoutIds: string[];
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
