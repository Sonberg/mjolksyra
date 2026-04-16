import { WorkoutMediaUploader } from "@/components/WorkoutMediaUploader/WorkoutMediaUploader";
import { CompletedWorkout } from "@/services/completedWorkouts/type";
import { WorkoutChatComposerInput } from "@/components/WorkoutChat/WorkoutChatComposerInput";
import { WorkoutChatComposerSendButton } from "@/components/WorkoutChat/WorkoutChatComposerSendButton";

type WorkoutMedia = NonNullable<CompletedWorkout["media"]>[number];

type Props = {
  traineeId: string;
  completedWorkoutId: string;
  message: string;
  onMessageChange: (value: string) => void;
  media: WorkoutMedia[];
  onMediaChange: (media: WorkoutMedia[]) => void;
  onMediaPendingChange: (isPending: boolean) => void;
  isSending: boolean;
  canSend: boolean;
  onSend: () => void;
};

export function WorkoutChatComposer({
  traineeId,
  completedWorkoutId,
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
    <div className="border-t border-[var(--shell-border)]">
      <div className="bg-[var(--shell-surface-strong)] p-2 shadow-[0_-6px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-end gap-2">
          <WorkoutChatComposerInput value={message} onChange={onMessageChange} />
          <WorkoutChatComposerSendButton
            isSending={isSending}
            canSend={canSend}
            onSend={onSend}
          />
        </div>
        <div className="mt-2">
          <WorkoutMediaUploader
            traineeId={traineeId}
            workoutId={completedWorkoutId}
            media={media}
            onUploadComplete={onMediaChange}
            isPending={isSending}
            onPendingChange={onMediaPendingChange}
            compact
          />
        </div>
      </div>
    </div>
  );
}
