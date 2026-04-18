import { WorkoutMediaUploader } from "@/components/WorkoutMediaUploader/WorkoutMediaUploader";
import { CompletedWorkout } from "@/services/completedWorkouts/type";
import { ChatMessageComposer } from "@/components/Chat";

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
    <ChatMessageComposer
      value={message}
      onChange={onMessageChange}
      onSend={onSend}
      isSending={isSending}
      canSend={canSend}
      placeholder="Write a message..."
    >
      <WorkoutMediaUploader
        traineeId={traineeId}
        workoutId={completedWorkoutId}
        media={media}
        onUploadComplete={onMediaChange}
        isPending={isSending}
        onPendingChange={onMediaPendingChange}
        compact
      />
    </ChatMessageComposer>
  );
}
