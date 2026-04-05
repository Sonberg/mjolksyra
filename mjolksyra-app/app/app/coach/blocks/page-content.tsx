"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CalendarRangeIcon,
  DumbbellIcon,
  Layers3Icon,
  Loader2Icon,
  Pencil,
  PlusIcon,
  Trash2,
} from "lucide-react";
import dayjs from "dayjs";

import { getBlocks } from "@/services/blocks/getBlocks";
import { createBlock } from "@/services/blocks/createBlock";
import { deleteBlock } from "@/services/blocks/deleteBlock";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/dialogs/ConfirmDialog";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { CoachWorkspaceShell } from "../CoachWorkspaceShell";
import { Block } from "@/services/blocks/type";

const dayLabelByIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function renderBlockPreview(block: Block) {
  const validWorkouts = block.workouts.filter(
    (x) =>
      x.week >= 1 &&
      x.week <= block.numberOfWeeks &&
      x.dayOfWeek >= 1 &&
      x.dayOfWeek <= 7,
  );

  if (validWorkouts.length === 0) {
    return (
      <div className="mt-3 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
        <p className="text-xs text-[var(--shell-muted)]">No workouts in this block yet.</p>
      </div>
    );
  }

  const grouped = new Map<number, Map<number, string[]>>();
  for (const workout of validWorkouts) {
    if (!grouped.has(workout.week)) {
      grouped.set(workout.week, new Map<number, string[]>());
    }

    grouped.set(
      workout.week,
      (grouped.get(workout.week) ?? new Map<number, string[]>()).set(
        workout.dayOfWeek,
        workout.exercises.map((x) => x.name),
      ),
    );
  }

  const sortedWeeks = [...grouped.entries()].sort((a, b) => a[0] - b[0]).slice(0, 2);

  return (
    <div className="mt-2 grid gap-2 md:grid-cols-2">
      {sortedWeeks.map(([weekNumber, days]) => {
        const sortedDays = [...days.entries()].sort((a, b) => a[0] - b[0]).slice(0, 3);
        return (
          <div
            key={weekNumber}
            className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2"
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
              Week {weekNumber}
            </p>
            <div className="space-y-1">
              {sortedDays.map(([dayIndex, exercises]) => (
                <p key={dayIndex} className="text-xs text-[var(--shell-ink)]">
                  <span className="mr-1 text-[var(--shell-muted)]">
                    {dayLabelByIndex[dayIndex - 1] ?? `Day ${dayIndex}`}:
                  </span>
                  {exercises.slice(0, 2).join(", ")}
                  {exercises.length > 2 ? ` +${exercises.length - 2}` : ""}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BlocksPageContent() {
  const router = useRouter();
  const client = useQueryClient();

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["blocks"],
    queryFn: getBlocks,
  });
  const sortedBlocks = [...blocks].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );

  const createMutation = useMutation({
    mutationFn: createBlock,
    onSuccess: (block) => {
      router.push(`/app/coach/blocks/${block.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlock,
    onSuccess: () => client.invalidateQueries({ queryKey: ["blocks"] }),
  });

  const handleCreate = () => {
    createMutation.mutate({
      block: {
        name: "New Block",
        numberOfWeeks: 4,
        workouts: [],
      },
    });
  };

  const totalWorkouts = sortedBlocks.reduce(
    (sum, block) => sum + block.workouts.length,
    0,
  );
  const totalExercises = sortedBlocks.reduce(
    (sum, block) =>
      sum +
      block.workouts.reduce(
        (count, workout) => count + workout.exercises.length,
        0,
      ),
    0,
  );

  return (
    <CoachWorkspaceShell>
      <PageSectionHeader
        title="Training Blocks"
        titleClassName="text-2xl md:text-3xl"
        description="Build reusable training plans and organize sessions week by week."
        actions={
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-none border border-transparent bg-[var(--shell-accent)] px-5 py-2 font-semibold text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            New Block
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--shell-muted)]">Total blocks</p>
            <Layers3Icon className="h-4 w-4 text-[var(--shell-muted)]" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-[var(--shell-ink)]">
            {sortedBlocks.length}
          </p>
        </div>
        <div
          className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5"
          style={{ animationDelay: "90ms" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--shell-muted)]">Planned sessions</p>
            <CalendarRangeIcon className="h-4 w-4 text-[var(--shell-muted)]" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-[var(--shell-ink)]">
            {totalWorkouts}
          </p>
        </div>
        <div
          className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--shell-muted)]">Exercises in blocks</p>
            <DumbbellIcon className="h-4 w-4 text-[var(--shell-muted)]" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-[var(--shell-ink)]">
            {totalExercises}
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] blocks-pulse"
            />
          ))}
        </div>
      ) : sortedBlocks.length === 0 ? (
        <div className="rounded-none border border-dashed border-[var(--shell-border)] bg-[var(--shell-surface)] px-6 py-16 text-center">
          <p className="text-xl font-semibold text-[var(--shell-ink)]">
            No blocks yet
          </p>
          <p className="mt-2 text-base text-[var(--shell-muted)]">
            Create your first training block and start planning week-by-week.
          </p>
          <Button
            onClick={handleCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-none border border-transparent bg-[var(--shell-accent)] px-5 py-2 font-semibold text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)]"
          >
            <PlusIcon className="h-4 w-4" />
            Create your first block
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedBlocks.map((block, index) => {
            const blockExercises = block.workouts.reduce(
              (count, workout) => count + workout.exercises.length,
              0,
            );
            const isDeleting =
              deleteMutation.isPending &&
              deleteMutation.variables?.blockId === block.id;

            return (
              <div
                key={block.id}
                className="group border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 transition-colors hover:bg-[var(--shell-surface-strong)]"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl text-[var(--shell-ink)]">
                        {block.name}
                      </h2>
                      <span className="rounded-none border border-[var(--shell-border)] px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
                        {block.numberOfWeeks} week
                        {block.numberOfWeeks !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--shell-muted)]">
                      {block.workouts.length} workout
                      {block.workouts.length !== 1 ? "s" : ""} ·{" "}
                      {blockExercises} exercise
                      {blockExercises !== 1 ? "s" : ""}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.08em] text-[var(--shell-muted)]">
                      Created {dayjs(block.createdAt).format("MMM D, YYYY")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 lg:justify-self-end">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/app/coach/blocks/${block.id}`)
                      }
                      className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] font-semibold text-[var(--shell-surface)] hover:bg-[var(--shell-border)]"
                    >
                      <Pencil className="mr-1 h-4 w-4" />
                      Open
                      <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Button>
                    <ConfirmDialog
                      title={`Delete "${block.name}"?`}
                      description="This action cannot be reversed."
                      continueButtonVariant="destructive"
                      continueButton="Yes, delete"
                      cancelButton="Cancel"
                      onConfirm={() =>
                        deleteMutation.mutate({ blockId: block.id })
                      }
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isDeleting}
                          className="rounded-none border border-[var(--shell-border)] bg-transparent text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]"
                        >
                          {isDeleting ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 border-t border-[var(--shell-border)]/30 pt-3">
                  {renderBlockPreview(block)}
                  {block.workouts.length > 0 && block.numberOfWeeks > 2 ? (
                    <p className="mt-2 text-[11px] text-[var(--shell-muted)]">
                      Showing first 2 weeks preview.
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CoachWorkspaceShell>
  );
}
