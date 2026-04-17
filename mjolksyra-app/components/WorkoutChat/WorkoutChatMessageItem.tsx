import dayjs from "dayjs";
import { WorkoutMediaGallery } from "@/components/WorkoutMediaGallery/WorkoutMediaGallery";
import { CompletedWorkoutChatMessage } from "@/services/plannedWorkouts/type";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  const roleLabel = chatMessage.role === "Athlete" ? "Athlete" : "Coach";
  const hasMessage = chatMessage.message.trim().length > 0;
  const hasMedia = chatMessage.media.length > 0;

  return (
    <article className={isSelf ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isSelf
            ? "flex max-w-[88%] flex-col items-end sm:max-w-[76%]"
            : "flex max-w-[88%] flex-col items-start sm:max-w-[76%]"
        }
      >
        <div
          className={
            isSelf
              ? "mb-1 flex justify-end text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]"
              : "mb-1 flex justify-start text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]"
          }
        >
          {roleLabel}
        </div>
        {editingMessageId === chatMessage.id ? (
          <div
            className={
              isSelf
                ? "inline-flex max-w-full flex-col bg-[var(--shell-bg)] px-3 py-2 text-[var(--shell-ink)]"
                : "inline-flex max-w-full flex-col px-3 py-2 text-[var(--shell-ink)]"
            }
          >
            <div className="flex flex-col gap-2">
              <Textarea
                value={editingMessageBody}
                onChange={(e) => onEditMessageBodyChange(e.target.value)}
                rows={3}
                className="resize-y"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancelEditing}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    isEditPending || editingMessageBody.trim().length === 0
                  }
                  onClick={onSaveEditing}
                >
                  {isEditPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
        {editingMessageId !== chatMessage.id && hasMessage ? (
          <div
            className={
              isSelf
                ? "inline-flex max-w-full bg-[var(--shell-bg)] px-3 py-2 text-[var(--shell-ink)]"
                : "inline-flex max-w-full px-3 py-2 text-[var(--shell-ink)]"
            }
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-6">
              {chatMessage.message}
            </p>
          </div>
        ) : null}
        {editingMessageId !== chatMessage.id && hasMedia ? (
          <div
            className={"mt-2 inline-flex max-w-full text-[var(--shell-ink)]"}
          >
            <WorkoutMediaGallery
              media={chatMessage.media}
              thumbnailSize="small"
              thumbnailClassName="border-white/20"
            />
          </div>
        ) : null}
        <p
          className={
            isSelf
              ? "mt-2 text-right text-[11px] text-[var(--shell-muted)]"
              : "mt-2 text-[11px] text-[var(--shell-muted)]"
          }
        >
          {dayjs(chatMessage.createdAt).format("HH:mm")}
          {dayjs(chatMessage.modifiedAt).isAfter(dayjs(chatMessage.createdAt))
            ? " · edited"
            : ""}
        </p>
        {isSelf && editingMessageId !== chatMessage.id ? (
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={() =>
                onStartEditing(chatMessage.id, chatMessage.message)
              }
              className="px-2 py-1 text-[11px] font-semibold text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
            >
              Edit
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
