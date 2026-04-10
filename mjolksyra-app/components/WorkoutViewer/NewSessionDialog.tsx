"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { createPlannedWorkout } from "@/services/plannedWorkouts/createPlannedWorkout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  traineeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (workoutId: string) => void;
};

export function NewSessionDialog({
  traineeId,
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

  const create = useMutation({
    mutationFn: () =>
      createPlannedWorkout({
        plannedWorkout: {
          id: "",
          traineeId,
          name: null,
          note: null,
          plannedAt: date,
          publishedExercises: [],
          draftExercises: null,
          createdAt: null,
          appliedBlock: null,
        },
      }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
      onOpenChange(false);
      onCreated(created.id);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(28rem,92vw)] max-w-none gap-0 overflow-hidden rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-0 text-[var(--shell-ink)]">
        <DialogHeader className="border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
          <DialogTitle className="font-[var(--font-display)] text-lg text-[var(--shell-ink)]">
            New session
          </DialogTitle>
          <p className="text-xs font-medium text-[var(--shell-muted)]">
            Create a new training session for a specific date.
          </p>
        </DialogHeader>

        <div className="px-4 py-5">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 h-10 w-full border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 text-sm text-[var(--shell-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--shell-accent)]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface-strong)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!date || create.isPending}
            onClick={() => create.mutate()}
            className="rounded-none border border-transparent bg-[var(--shell-accent)] px-3 py-2 text-xs font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
          >
            {create.isPending ? "Creating..." : "Create session"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
