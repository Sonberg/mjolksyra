"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { createCompletedWorkout } from "@/services/completedWorkouts/createCompletedWorkout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
      createCompletedWorkout({
        traineeId,
        plannedAt: date,
      }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["completed-workouts"] });
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

        <div className="flex flex-col gap-2 px-4 py-5">
          <Label
            htmlFor="session-date"
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]"
          >
            Date
          </Label>
          <Input
            id="session-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <Separator />
        <div className="flex items-center justify-end gap-2 bg-[var(--shell-surface-strong)] px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!date || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Creating..." : "Create session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
