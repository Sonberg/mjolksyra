import { ApiClient } from "../client";

type Args = {
  traineeId: string;
  sessionId: string;
};

export async function deleteAIPlannerSession({ traineeId, sessionId }: Args) {
  await ApiClient.delete(`/api/trainees/${traineeId}/ai-planner/session/${sessionId}`);
}
