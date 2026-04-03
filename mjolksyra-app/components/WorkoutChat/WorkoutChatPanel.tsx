"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { addPlannedWorkoutChatMessage } from "@/services/plannedWorkouts/addPlannedWorkoutChatMessage";
import { getPlannedWorkoutChatMessages } from "@/services/plannedWorkouts/getPlannedWorkoutChatMessages";
import { updatePlannedWorkoutChatMessage } from "@/services/plannedWorkouts/updatePlannedWorkoutChatMessage";
import { analyzeWorkoutMedia } from "@/services/plannedWorkouts/analyzeWorkoutMedia";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { WorkoutChatComposer } from "@/components/WorkoutChat/WorkoutChatComposer";
import { WorkoutChatMessageItem } from "@/components/WorkoutChat/WorkoutChatMessageItem";

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

  const analyze = useMutation({
    mutationFn: async () =>
      analyzeWorkoutMedia({
        traineeId,
        plannedWorkoutId,
        analysis: {
          text: message,
          mediaUrls: media.map((x) => x.rawUrl),
        },
      }),
  });

  const canSend = useMemo(() => {
    return (message.trim().length > 0 || media.length > 0) && !isMediaPending;
  }, [isMediaPending, media.length, message]);

  const canAnalyze = useMemo(() => {
    return (message.trim().length > 0 || media.length > 0) && !isMediaPending;
  }, [isMediaPending, media.length, message]);

  const counterpartLabel = viewerMode === "athlete" ? "Coach" : "Athlete";

  return (
    <section
      className="overflow-hidden rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]"
      data-testid="workout-chat-panel"
    >
      <div className="border-b border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--shell-ink)]">{counterpartLabel}</p>
          <p className="text-[11px] font-medium text-[var(--shell-muted)]">Workout chat</p>
        </div>
      </div>

      <div
        className="max-h-96 space-y-3 overflow-y-auto bg-[var(--shell-surface-strong)] px-3 py-4 sm:px-4"
        data-testid="workout-chat-messages"
      >
        {analyze.isPending ? (
          <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs font-medium text-[var(--shell-muted)]">
            Analyzing workout notes and media...
          </div>
        ) : null}

        {analyze.isError ? (
          <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs font-medium text-red-500">
            Could not analyze this check-in right now.
          </div>
        ) : null}

        {analyze.data ? (
          <article className="rounded-2xl border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
              AI analysis
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--shell-ink)]">{analyze.data.summary}</p>
            {analyze.data.keyFindings.length > 0 ? (
              <p className="mt-2 text-xs text-[var(--shell-muted)]">
                Findings: {analyze.data.keyFindings.join("; ")}
              </p>
            ) : null}
            {analyze.data.techniqueRisks.length > 0 ? (
              <p className="mt-1 text-xs text-[var(--shell-muted)]">
                Risks: {analyze.data.techniqueRisks.join("; ")}
              </p>
            ) : null}
            {analyze.data.coachSuggestions.length > 0 ? (
              <p className="mt-1 text-xs text-[var(--shell-muted)]">
                Suggestions: {analyze.data.coachSuggestions.join("; ")}
              </p>
            ) : null}
          </article>
        ) : null}

        {chatMessages.isLoading ? (
          <p className="text-sm text-[var(--shell-muted)]">Loading messages...</p>
        ) : null}

        {!chatMessages.isLoading && (chatMessages.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-[var(--shell-muted)]">No messages yet.</p>
        ) : null}

        {(chatMessages.data ?? []).map((chatMessage) => {
          return (
            <WorkoutChatMessageItem
              key={chatMessage.id}
              chatMessage={chatMessage}
              viewerMode={viewerMode}
              editingMessageId={editingMessageId}
              editingMessageBody={editingMessageBody}
              isEditPending={editMessage.isPending}
              onEditMessageBodyChange={setEditingMessageBody}
              onStartEditing={(messageId, messageBody) => {
                setEditingMessageId(messageId);
                setEditingMessageBody(messageBody);
              }}
              onCancelEditing={() => {
                setEditingMessageId(null);
                setEditingMessageBody("");
              }}
              onSaveEditing={() => editMessage.mutate()}
            />
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
        isAnalyzing={analyze.isPending}
        canSend={canSend}
        canAnalyze={canAnalyze}
        onSend={() => sendMessage.mutate()}
        onAnalyze={() => analyze.mutate()}
      />
    </section>
  );
}
