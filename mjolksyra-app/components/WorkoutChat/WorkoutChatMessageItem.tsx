import dayjs from "dayjs";
import { WorkoutMediaGallery } from "@/components/WorkoutMediaGallery/WorkoutMediaGallery";
import { PlannedWorkoutChatMessage } from "@/services/plannedWorkouts/type";

type Props = {
  chatMessage: PlannedWorkoutChatMessage;
  viewerMode: "athlete" | "coach";
  selfLabel: string;
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
  selfLabel,
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

  return (
    <article
      className={isSelf ? "flex items-end justify-end gap-2" : "flex items-end justify-start gap-2"}
    >
      {!isSelf ? (
        <span className="mb-1 grid h-7 w-7 shrink-0 place-items-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[11px] font-bold text-[var(--shell-muted)]">
          {roleLabel.slice(0, 1)}
        </span>
      ) : null}
      <div className="max-w-[88%] sm:max-w-[76%]">
        <div
          className={
            isSelf
              ? "rounded-2xl rounded-br-md border border-[var(--shell-accent)]/80 bg-[var(--shell-accent)] px-3 py-2.5 text-[var(--shell-accent-ink)]"
              : "rounded-2xl rounded-bl-md border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2.5 text-[var(--shell-ink)]"
          }
        >
          {editingMessageId === chatMessage.id ? (
            <div className="space-y-2">
              <textarea
                value={editingMessageBody}
                onChange={(e) => onEditMessageBodyChange(e.target.value)}
                rows={3}
                className="w-full resize-y rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm leading-6 text-[var(--shell-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancelEditing}
                  className="rounded-lg border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[11px] font-semibold text-[var(--shell-ink)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isEditPending || editingMessageBody.trim().length === 0}
                  onClick={onSaveEditing}
                  className="rounded-lg border border-transparent bg-[var(--shell-ink)] px-2 py-1 text-[11px] font-semibold text-[var(--shell-surface)] disabled:opacity-60"
                >
                  {isEditPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : chatMessage.message.trim().length > 0 ? (
            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-6">
              {chatMessage.message}
            </p>
          ) : null}
          {chatMessage.media.length > 0 ? (
            <div className={chatMessage.message.trim().length > 0 ? "mt-2" : ""}>
              <WorkoutMediaGallery
                media={chatMessage.media}
                thumbnailSize="small"
                thumbnailClassName="rounded-xl border-white/35 shadow-sm"
              />
            </div>
          ) : null}
        </div>
        <p
          className={
            isSelf
              ? "mt-2 text-right text-xs font-medium text-[var(--shell-muted)]"
              : "mt-2 text-xs font-medium text-[var(--shell-muted)]"
          }
        >
          {roleLabel} · {dayjs(chatMessage.createdAt).format("HH:mm")}
          {dayjs(chatMessage.modifiedAt).isAfter(dayjs(chatMessage.createdAt)) ? " · edited" : ""}
        </p>
        {isSelf && editingMessageId !== chatMessage.id ? (
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={() => onStartEditing(chatMessage.id, chatMessage.message)}
              className="text-[11px] font-semibold text-[var(--shell-muted)] underline-offset-2 transition hover:text-[var(--shell-ink)] hover:underline"
            >
              Edit
            </button>
          </div>
        ) : null}
      </div>
      {isSelf ? (
        <span className="mb-1 grid h-7 w-7 shrink-0 place-items-center rounded-none border border-[var(--shell-accent)]/50 bg-[var(--shell-accent)]/20 text-[11px] font-bold text-[var(--shell-ink)]">
          {selfLabel.slice(0, 1)}
        </span>
      ) : null}
    </article>
  );
}
