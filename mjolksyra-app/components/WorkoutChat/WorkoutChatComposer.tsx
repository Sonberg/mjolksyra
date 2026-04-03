import { WorkoutMediaUploader } from "@/components/WorkoutMediaUploader/WorkoutMediaUploader";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
  message: string;
  onMessageChange: (value: string) => void;
  media: PlannedWorkout["media"];
  onMediaChange: (media: PlannedWorkout["media"]) => void;
  onMediaPendingChange: (isPending: boolean) => void;
  isSending: boolean;
  canSend: boolean;
  onSend: () => void;
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
  canSend,
  onSend,
}: Props) {
  return (
    <div className="border-t border-[var(--shell-border)] bg-[var(--shell-surface)] p-2.5 sm:p-3">
      <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-1.5">
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={1}
          placeholder="Write a message..."
          data-testid="workout-chat-composer"
          className="w-full min-h-10 resize-none border-0 bg-transparent px-2 py-1 text-sm leading-5 text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
        />
      </div>
      <div className="mt-1.5">
        <WorkoutMediaUploader
          traineeId={traineeId}
          plannedWorkoutId={plannedWorkoutId}
          media={media}
          onUploadComplete={onMediaChange}
          isPending={isSending}
          onPendingChange={onMediaPendingChange}
        />
      </div>
      <div className="mt-1.5 flex justify-end">
        <button
          type="button"
          disabled={!canSend || isSending}
          onClick={onSend}
          className="rounded-none border border-transparent bg-[var(--shell-accent)] px-3.5 py-1.5 text-[11px] font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
