"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { addPlannedWorkoutChatMessage } from "@/services/plannedWorkouts/addPlannedWorkoutChatMessage";
import { getPlannedWorkoutChatMessages } from "@/services/plannedWorkouts/getPlannedWorkoutChatMessages";
import { updatePlannedWorkoutChatMessage } from "@/services/plannedWorkouts/updatePlannedWorkoutChatMessage";
import { WorkoutMediaUploader } from "@/components/WorkoutMediaUploader/WorkoutMediaUploader";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { WorkoutMediaGallery } from "@/components/WorkoutMediaGallery/WorkoutMediaGallery";
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

  return (
    <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]">
      <div className="border-b border-[var(--shell-border)] px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
          Workout chat
        </p>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto bg-[var(--shell-surface-strong)]/40 p-3">
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

          return (
            <article
              key={chatMessage.id}
              className={isSelf ? "flex justify-end" : "flex justify-start"}
            >
              <div className="max-w-[85%] sm:max-w-[75%]">
                <div
                  className={
                    isSelf
                      ? "rounded-2xl rounded-br-md border border-[var(--shell-accent)]/20 bg-[var(--shell-accent)] px-3 py-2 text-[var(--shell-accent-ink)]"
                      : "rounded-2xl rounded-bl-md border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-[var(--shell-ink)]"
                  }
                >
                  {editingMessageId === chatMessage.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingMessageBody}
                        onChange={(e) => setEditingMessageBody(e.target.value)}
                        rows={3}
                        className="w-full resize-y rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1.5 text-sm text-[var(--shell-ink)] outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditingMessageBody("");
                          }}
                          className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[11px] font-semibold text-[var(--shell-ink)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={editMessage.isPending || editingMessageBody.trim().length === 0}
                          onClick={() => editMessage.mutate()}
                          className="rounded-none border border-transparent bg-[var(--shell-ink)] px-2 py-1 text-[11px] font-semibold text-[var(--shell-surface)] disabled:opacity-60"
                        >
                          {editMessage.isPending ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : chatMessage.message.trim().length > 0 ? (
                    <p className="whitespace-pre-wrap text-sm">{chatMessage.message}</p>
                  ) : null}
                  {chatMessage.media.length > 0 ? (
                    <div className={chatMessage.message.trim().length > 0 ? "mt-2" : ""}>
                      <WorkoutMediaGallery media={chatMessage.media} />
                    </div>
                  ) : null}
                </div>
                <p
                  className={
                    isSelf
                      ? "mt-1 text-right text-[10px] text-[var(--shell-muted)]"
                      : "mt-1 text-[10px] text-[var(--shell-muted)]"
                  }
                >
                  {chatMessage.role === "Athlete" ? "Athlete" : "Coach"} · {dayjs(chatMessage.createdAt).format("HH:mm")}
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
            </article>
          );
        })}
      </div>

      <div className="border-t border-[var(--shell-border)] p-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Write a message..."
          className="w-full resize-y rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
        />
        <div className="mt-2">
          <WorkoutMediaUploader
            traineeId={traineeId}
            plannedWorkoutId={plannedWorkoutId}
            media={media}
            onUploadComplete={setMedia}
            isPending={sendMessage.isPending}
            onPendingChange={setIsMediaPending}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            disabled={!canSend || sendMessage.isPending}
            onClick={() => sendMessage.mutate()}
            className="rounded-none border border-transparent bg-[var(--shell-accent)] px-3 py-2 text-xs font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
          >
            {sendMessage.isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}
