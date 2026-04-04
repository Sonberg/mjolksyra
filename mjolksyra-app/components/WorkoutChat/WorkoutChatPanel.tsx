"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { addPlannedWorkoutChatMessage } from "@/services/plannedWorkouts/addPlannedWorkoutChatMessage";
import { getPlannedWorkoutChatMessages } from "@/services/plannedWorkouts/getPlannedWorkoutChatMessages";
import { updatePlannedWorkoutChatMessage } from "@/services/plannedWorkouts/updatePlannedWorkoutChatMessage";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { WorkoutChatComposer } from "@/components/WorkoutChat/WorkoutChatComposer";
import { WorkoutChatMessageItem } from "@/components/WorkoutChat/WorkoutChatMessageItem";

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
  viewerMode: "athlete" | "coach";
};

export function WorkoutChatPanel({
  traineeId,
  plannedWorkoutId,
  viewerMode,
}: Props) {
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

  return (
    <section
      className="flex h-full flex-col overflow-hidden"
      data-testid="workout-chat-panel"
    >
      <div className="border-b border-[var(--shell-border)] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Chat</p>
      </div>

      <div
        className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4"
        data-testid="workout-chat-messages"
      >
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
        canSend={canSend}
        onSend={() => sendMessage.mutate()}
      />
    </section>
  );
}

