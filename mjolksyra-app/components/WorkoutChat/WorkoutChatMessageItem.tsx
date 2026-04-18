import { WorkoutMediaGallery } from "@/components/WorkoutMediaGallery/WorkoutMediaGallery";
import { CompletedWorkoutChatMessage } from "@/services/plannedWorkouts/type";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/Chat";

type Props = {
  chatMessage: CompletedWorkoutChatMessage;
  viewerMode: "athlete" | "coach";
  editingMessageId: string | null;
  editingMessageBody: string;
  isEditPending: boolean;
  onEditMessageBodyChange: (value: string) => void;
  onStartEditing: (messageId: string, messageBody: string) => void;
  onCancelEditing: () => void;
  onSaveEditing: () => void;
};

export function WorkoutChatMessageItem({
  chatMessage,
  viewerMode,
  editingMessageId,
  editingMessageBody,
  isEditPending,
  onEditMessageBodyChange,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
}: Props) {
  const isSelf =
    (viewerMode === "athlete" && chatMessage.role === "Athlete") ||
    (viewerMode === "coach" && chatMessage.role === "Coach");
  const isEditing = editingMessageId === chatMessage.id;
  const hasMedia = chatMessage.media.length > 0;
  const isEdited =
    chatMessage.modifiedAt > chatMessage.createdAt;

  const editForm = isEditing ? (
    <div className="inline-flex max-w-full flex-col border border-[var(--shell-border)] bg-[var(--shell-bg)] px-3 py-2 text-[var(--shell-ink)]">
      <div className="flex flex-col gap-2">
        <Textarea
          value={editingMessageBody}
          onChange={(e) => onEditMessageBodyChange(e.target.value)}
          rows={3}
          className="resize-y"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancelEditing}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isEditPending || editingMessageBody.trim().length === 0}
            onClick={onSaveEditing}
          >
            {isEditPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  ) : undefined;

  const footer = isSelf && !isEditing ? (
    <div className={isSelf ? "flex justify-end" : undefined}>
      <button
        type="button"
        onClick={() => onStartEditing(chatMessage.id, chatMessage.message)}
        className="px-2 py-1 text-[11px] font-semibold text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
      >
        Edit
      </button>
    </div>
  ) : undefined;

  return (
    <ChatMessage
      align={isSelf ? "end" : "start"}
      label={chatMessage.role}
      timestamp={chatMessage.createdAt}
      isEdited={isEdited}
      editForm={editForm}
      footer={footer}
    >
      <div className="flex flex-col gap-2">
        {chatMessage.message.trim().length > 0 && (
          <p className="whitespace-pre-wrap break-words">{chatMessage.message}</p>
        )}
        {hasMedia && (
          <WorkoutMediaGallery
            media={chatMessage.media}
            thumbnailSize="small"
            thumbnailClassName="border-white/20"
          />
        )}
      </div>
    </ChatMessage>
  );
}
