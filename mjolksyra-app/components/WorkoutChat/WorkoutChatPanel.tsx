"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { addCompletedWorkoutChatMessage } from "@/services/completedWorkouts/addCompletedWorkoutChatMessage";
import { getCompletedWorkoutChatMessages } from "@/services/completedWorkouts/getCompletedWorkoutChatMessages";
import { updateCompletedWorkoutChatMessage } from "@/services/completedWorkouts/updateCompletedWorkoutChatMessage";
import { CompletedWorkout } from "@/services/completedWorkouts/type";
import { WorkoutChatComposer } from "@/components/WorkoutChat/WorkoutChatComposer";
import { WorkoutChatMessageItem } from "@/components/WorkoutChat/WorkoutChatMessageItem";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  traineeId: string;
  completedWorkoutId: string;
  viewerMode: "athlete" | "coach";
};

export function WorkoutChatPanel({
  traineeId,
  completedWorkoutId,
  viewerMode,
}: Props) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<NonNullable<CompletedWorkout["media"]>>([]);
  const [isMediaPending, setIsMediaPending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageBody, setEditingMessageBody] = useState("");

  const chatMessages = useQuery({
    queryKey: ["completed-workout-chat", traineeId, completedWorkoutId],
    queryFn: ({ signal }) =>
      getCompletedWorkoutChatMessages({
        traineeId,
        completedWorkoutId,
        signal,
      }),
  });

  const sendMessage = useMutation({
    mutationFn: async () =>
      addCompletedWorkoutChatMessage({
        traineeId,
        completedWorkoutId,
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
        queryKey: ["completed-workout-chat", traineeId, completedWorkoutId],
      });
      await queryClient.invalidateQueries({ queryKey: ["completed-workouts"] });
    },
  });

  const editMessage = useMutation({
    mutationFn: async () => {
      if (!editingMessageId) {
        return null;
      }

      return updateCompletedWorkoutChatMessage({
        traineeId,
        completedWorkoutId,
        chatMessageId: editingMessageId,
        message: editingMessageBody,
      });
    },
    onSuccess: async () => {
      setEditingMessageId(null);
      setEditingMessageBody("");
      await queryClient.invalidateQueries({
        queryKey: ["completed-workout-chat", traineeId, completedWorkoutId],
      });
    },
  });

  const canSend = useMemo(() => {
    return (message.trim().length > 0 || media.length > 0) && !isMediaPending;
  }, [isMediaPending, media.length, message]);

  const counterpartLabel = viewerMode === "athlete" ? "Coach" : "Athlete";

  return (
    <section
      className="flex h-full flex-col overflow-hidden"
      data-testid="workout-chat-panel"
    >
      <div className="border-b border-[var(--shell-border)] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--shell-muted)]">
              Conversation
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--shell-ink)]">
              {viewerMode === "coach" ? "Athlete chat" : "Coach chat"}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 rounded-none">
            Shared thread
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1" data-testid="workout-chat-messages">
        <div className="flex min-h-full flex-col justify-end px-3 py-4 sm:px-4">
          {chatMessages.isLoading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`flex ${index === 1 ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex w-[78%] max-w-[320px] flex-col gap-2 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
                    <Skeleton className="h-2.5 w-24 rounded-none" />
                    <Skeleton className="h-2.5 w-full rounded-none" />
                    <Skeleton className="h-2.5 w-3/4 rounded-none" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!chatMessages.isLoading && (chatMessages.data?.length ?? 0) === 0 ? (
            <div className="mx-auto my-6 max-w-[320px] border border-dashed border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-5 text-center">
              <p className="text-sm font-semibold text-[var(--shell-ink)]">
                Start the conversation
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--shell-muted)]">
                {viewerMode === "athlete"
                  ? `Ask your ${counterpartLabel.toLowerCase()} questions, share reflections, or upload media from this workout.`
                  : `Use this thread to coach your ${counterpartLabel.toLowerCase()} and keep workout feedback in one place.`}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2.5">
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
        </div>
      </ScrollArea>

      <WorkoutChatComposer
        traineeId={traineeId}
        completedWorkoutId={completedWorkoutId}
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
