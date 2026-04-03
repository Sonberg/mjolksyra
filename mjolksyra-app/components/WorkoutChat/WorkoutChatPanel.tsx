"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { addPlannedWorkoutChatMessage } from "@/services/plannedWorkouts/addPlannedWorkoutChatMessage";
import { getPlannedWorkoutChatMessages } from "@/services/plannedWorkouts/getPlannedWorkoutChatMessages";
import { updatePlannedWorkoutChatMessage } from "@/services/plannedWorkouts/updatePlannedWorkoutChatMessage";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { WorkoutMediaGallery } from "@/components/WorkoutMediaGallery/WorkoutMediaGallery";
import { WorkoutChatComposer } from "@/components/WorkoutChat/WorkoutChatComposer";
import dayjs from "dayjs";

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
  viewerMode: "athlete" | "coach";
};

export function WorkoutChatPanel({ traineeId, plannedWorkoutId, viewerMode }: Props) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<PlannedWorkout["media"]>([]);
  const [isMediaPending, setIsMediaPending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageBody, setEditingMessageBody] = useState("");

  const chatMessages = useQuery({
    queryKey: ["planned-workout-chat", traineeId, plannedWorkoutId],
    queryFn: ({ signal }) =>
      getPlannedWorkoutChatMessages({
        traineeId,
        plannedWorkoutId,
        signal,
      }),
  });

  const sendMessage = useMutation({
    mutationFn: async () =>
      addPlannedWorkoutChatMessage({
        traineeId,
        plannedWorkoutId,
        message: {
          message,
          mediaUrls: media.map((x) => x.rawUrl),
          role: viewerMode === "coach" ? "Coach" : "Athlete",
        },
      }),
    onSuccess: async () => {
      setMessage("");
      setMedia([]);
      await queryClient.invalidateQueries({
        queryKey: ["planned-workout-chat", traineeId, plannedWorkoutId],
      });
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["planned-workout"] });
    },
  });

  const editMessage = useMutation({
    mutationFn: async () => {
      if (!editingMessageId) {
        return null;
      }

      return updatePlannedWorkoutChatMessage({
        traineeId,
        plannedWorkoutId,
        chatMessageId: editingMessageId,
        message: editingMessageBody,
      });
    },
    onSuccess: async () => {
      setEditingMessageId(null);
      setEditingMessageBody("");
      await queryClient.invalidateQueries({
        queryKey: ["planned-workout-chat", traineeId, plannedWorkoutId],
      });
    },
  });

  const canSend = useMemo(() => {
    return (message.trim().length > 0 || media.length > 0) && !isMediaPending;
  }, [isMediaPending, media.length, message]);

  const counterpartLabel = viewerMode === "athlete" ? "Coach" : "Athlete";
  const selfLabel = viewerMode === "athlete" ? "Athlete" : "Coach";

  return (
    <section
      className="overflow-hidden rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]"
      data-testid="workout-chat-panel"
    >
      <div className="border-b border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-sm font-bold text-[var(--shell-ink)]">
            {counterpartLabel.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--shell-ink)]">{counterpartLabel}</p>
            <p className="text-[11px] font-medium text-[var(--shell-muted)]">Workout chat</p>
          </div>
        </div>
      </div>

      <div
        className="max-h-96 space-y-3 overflow-y-auto bg-[var(--shell-surface-strong)] px-3 py-4 sm:px-4"
        data-testid="workout-chat-messages"
      >
        {chatMessages.isLoading ? (
          <p className="text-sm text-[var(--shell-muted)]">Loading messages...</p>
        ) : null}

        {!chatMessages.isLoading && (chatMessages.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-[var(--shell-muted)]">No messages yet.</p>
        ) : null}

        {(chatMessages.data ?? []).map((chatMessage) => {
          const isSelf =
            (viewerMode === "athlete" && chatMessage.role === "Athlete") ||
            (viewerMode === "coach" && chatMessage.role === "Coach");
          const roleLabel = chatMessage.role === "Athlete" ? "Athlete" : "Coach";

          return (
            <article
              key={chatMessage.id}
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
                        onChange={(e) => setEditingMessageBody(e.target.value)}
                        rows={3}
                        className="w-full resize-y rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm leading-6 text-[var(--shell-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditingMessageBody("");
                          }}
                          className="rounded-lg border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[11px] font-semibold text-[var(--shell-ink)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={editMessage.isPending || editingMessageBody.trim().length === 0}
                          onClick={() => editMessage.mutate()}
                          className="rounded-lg border border-transparent bg-[var(--shell-ink)] px-2 py-1 text-[11px] font-semibold text-[var(--shell-surface)] disabled:opacity-60"
                        >
                          {editMessage.isPending ? "Saving..." : "Save"}
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
                      onClick={() => {
                        setEditingMessageId(chatMessage.id);
                        setEditingMessageBody(chatMessage.message);
                      }}
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
        })}
      </div>

      <WorkoutChatComposer
        traineeId={traineeId}
        plannedWorkoutId={plannedWorkoutId}
        message={message}
        onMessageChange={setMessage}
        media={media}
        onMediaChange={setMedia}
        onMediaPendingChange={setIsMediaPending}
        isSending={sendMessage.isPending}
        canSend={canSend}
        onSend={() => sendMessage.mutate()}
      />
    </section>
  );
}
