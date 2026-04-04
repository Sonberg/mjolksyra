import { WorkoutMediaUploader } from "@/components/WorkoutMediaUploader/WorkoutMediaUploader";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { WorkoutChatComposerInput } from "@/components/WorkoutChat/WorkoutChatComposerInput";
import { WorkoutChatComposerSendButton } from "@/components/WorkoutChat/WorkoutChatComposerSendButton";

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
  message: string;
  onMessageChange: (value: string) => void;
  media: PlannedWorkout["media"];
  onMediaChange: (media: PlannedWorkout["media"]) => void;
  onMediaPendingChange: (isPending: boolean) => void;
  isSending: boolean;
  isAnalyzing: boolean;
  showAnalyze: boolean;
  canSend: boolean;
  canAnalyze: boolean;
  onSend: () => void;
  onAnalyze: () => void;
};

export function WorkoutChatComposer({
  traineeId,
  plannedWorkoutId,
  message,
  onMessageChange,
  media,
  onMediaChange,
  onMediaPendingChange,
  isSending,
  isAnalyzing,
  showAnalyze,
  canSend,
  canAnalyze,
  onSend,
  onAnalyze,
}: Props) {
  return (
    <div className="border-t border-[var(--shell-border)] bg-[var(--shell-surface)] p-2">
      <div className="flex items-stretch gap-1.5">
        <WorkoutChatComposerInput value={message} onChange={onMessageChange} />
        {showAnalyze ? (
          <button
            type="button"
            disabled={!canAnalyze || isAnalyzing}
            onClick={onAnalyze}
            className="min-h-10 shrink-0 self-stretch border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 text-[11px] font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-60"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
        ) : null}
        <WorkoutChatComposerSendButton
          isSending={isSending}
          canSend={canSend}
          onSend={onSend}
        />
      </div>
      <div className="mt-1">
        <WorkoutMediaUploader
          traineeId={traineeId}
          plannedWorkoutId={plannedWorkoutId}
          media={media}
          onUploadComplete={onMediaChange}
          isPending={isSending}
          onPendingChange={onMediaPendingChange}
          compact
        />
      </div>
    </div>
  );
}
