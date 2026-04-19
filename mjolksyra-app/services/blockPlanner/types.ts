export type PlannerFileContent = {
  name: string;
  type: string;
  content: string;
};

export type PlannerConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type BlockPlannerActionType =
  | "create_block_workout"
  | "update_block_workout"
  | "delete_block_workout"
  | "add_block_exercise"
  | "update_block_exercise"
  | "delete_block_exercise";

export type BlockPlannerSetDraft = {
  reps?: number | null;
  weightKg?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  note?: string | null;
};

export type BlockPlannerExerciseDraft = {
  id?: string | null;
  exerciseId?: string | null;
  name: string;
  note?: string | null;
  prescriptionType?: string | null;
  sets: BlockPlannerSetDraft[];
};

export type BlockPlannerWorkoutDraft = {
  name?: string | null;
  note?: string | null;
  week: number;
  dayOfWeek: number;
  exercises: BlockPlannerExerciseDraft[];
};

export type BlockPlannerActionProposal = {
  actionType: BlockPlannerActionType;
  summary: string;
  targetWorkoutId?: string | null;
  targetExerciseId?: string | null;
  targetWeek?: number | null;
  targetDayOfWeek?: number | null;
  previousWeek?: number | null;
  previousDayOfWeek?: number | null;
  workout?: BlockPlannerWorkoutDraft | null;
};

export type BlockPlannerCreditBreakdownItem = {
  actionType: string;
  count: number;
  unitCost: number;
  subtotal: number;
};

export type BlockPlannerActionSet = {
  id: string;
  status: "pending" | "applied" | "discarded" | "superseded";
  summary: string;
  explanation?: string | null;
  createdAt: string;
  creditCost: number;
  creditBreakdown: BlockPlannerCreditBreakdownItem[];
  actions: BlockPlannerActionProposal[];
};

export type ClarifyBlockPlanResponse = {
  sessionId: string;
  message: string;
  isReadyToApply: boolean;
  requiresApproval: boolean;
  options: string[];
  proposedActionSet: BlockPlannerActionSet | null;
};

export type LatestBlockPlannerSessionMessage = {
  role: "user" | "assistant";
  content: string;
  options: string[];
};

export type LatestBlockPlannerSessionResponse = {
  sessionId: string;
  description: string;
  conversationHistory: LatestBlockPlannerSessionMessage[];
  proposedActionSet: BlockPlannerActionSet | null;
};

export type ApplyBlockPlannerProposalResponse = {
  sessionId: string;
  proposalId: string;
  actionsApplied: number;
  summary: string;
};
