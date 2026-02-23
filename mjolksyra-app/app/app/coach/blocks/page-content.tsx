"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import {
  ArrowRightIcon,
  BoltIcon,
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
  const themeVars = {
    "--blocks-bg": "#090909",
    "--blocks-surface": "#111111",
    "--blocks-border": "#2b2b2b",
    "--blocks-text": "#f3f3f3",
    "--blocks-muted": "#9a9a9a",
    "--blocks-accent": "#ededed",
    "--blocks-accent-2": "#cfcfcf",
  } as CSSProperties;

  return (
    <div
      style={themeVars}
      className="font-[var(--font-body)] relative mx-auto max-w-6xl overflow-hidden px-4 py-8 md:px-6 md:py-10"
    >
      <section className="blocks-rise relative overflow-hidden rounded-[2rem] border p-6 md:p-10 [background:var(--blocks-surface)] [border-color:var(--blocks-border)]">
        <div className="pointer-events-none absolute -right-32 -top-16 h-56 w-56 rotate-12 rounded-[2rem] border [border-color:var(--blocks-border)] [background:rgba(255,255,255,0.03)]" />
        <div className="pointer-events-none absolute -left-20 bottom-6 h-40 w-40 -rotate-6 rounded-[1.25rem] border [border-color:var(--blocks-border)] [background:rgba(255,255,255,0.02)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] [color:var(--blocks-muted)]">
              <BoltIcon className="h-3.5 w-3.5 [color:#c7c7c7]" />
              Periodization Studio
            </p>
            <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl [color:var(--blocks-text)]">
              Training Blocks
            </h1>
            <p className="max-w-2xl text-base leading-relaxed [color:var(--blocks-muted)]">
              Architect programs with intent. Design week-to-week rhythm, then
              ship proven templates to athletes at scale.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border px-5 py-2 font-semibold transition hover:scale-[1.02] disabled:opacity-60 [border-color:#4a4a4a] [background:var(--blocks-accent)] [color:#101010] hover:[background:var(--blocks-accent-2)]"
          >
            {createMutation.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            New Block
          </Button>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="blocks-rise rounded-[1.25rem] border p-5 [background:var(--blocks-surface)] [border-color:var(--blocks-border)]">
          <div className="flex items-center justify-between">
            <p className="text-sm [color:var(--blocks-muted)]">Total blocks</p>
            <Layers3Icon className="h-4 w-4 [color:#c7c7c7]" />
          </div>
          <p className="font-[var(--font-display)] mt-3 text-3xl [color:var(--blocks-text)]">
            {sortedBlocks.length}
          </p>
        </div>
        <div
          className="blocks-rise rounded-[1.25rem] border p-5 [background:var(--blocks-surface)] [border-color:var(--blocks-border)]"
          style={{ animationDelay: "90ms" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm [color:var(--blocks-muted)]">
              Planned sessions
            </p>
            <CalendarRangeIcon className="h-4 w-4 [color:#c7c7c7]" />
          </div>
          <p className="font-[var(--font-display)] mt-3 text-3xl [color:var(--blocks-text)]">
            {totalWorkouts}
          </p>
        </div>
        <div
          className="blocks-rise rounded-[1.25rem] border p-5 [background:var(--blocks-surface)] [border-color:var(--blocks-border)]"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm [color:var(--blocks-muted)]">
              Exercises in blocks
            </p>
            <DumbbellIcon className="h-4 w-4 [color:#c7c7c7]" />
          </div>
          <p className="font-[var(--font-display)] mt-3 text-3xl [color:var(--blocks-text)]">
            {totalExercises}
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="mt-8 grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-[1.25rem] border [background:var(--blocks-surface)] [border-color:var(--blocks-border)] blocks-pulse"
            />
          ))}
        </div>
      ) : sortedBlocks.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] border border-dashed px-6 py-16 text-center [background:var(--blocks-surface)] [border-color:var(--blocks-border)]">
          <p className="font-[var(--font-display)] text-xl [color:var(--blocks-text)]">
            No blocks yet
          </p>
          <p className="mt-2 text-base [color:var(--blocks-muted)]">
            Create your first training block and start planning week-by-week.
          </p>
          <Button
            onClick={handleCreate}
            variant="outline"
            className="mt-6 border px-5 [border-color:#444] [background:rgba(255,255,255,0.05)] [color:var(--blocks-text)] hover:[background:rgba(255,255,255,0.12)]"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create your first block
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
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
                className="blocks-rise group rounded-[1.5rem] border p-5 transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)] [background:var(--blocks-surface)] [border-color:var(--blocks-border)]"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-[var(--font-display)] text-xl [color:var(--blocks-text)]">
                        {block.name}
                      </h2>
                      <span className="rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.1em] [border-color:var(--blocks-border)] [color:var(--blocks-muted)]">
                        {block.numberOfWeeks} week
                        {block.numberOfWeeks !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-sm [color:var(--blocks-muted)]">
                      {block.workouts.length} workout
                      {block.workouts.length !== 1 ? "s" : ""} ·{" "}
                      {blockExercises} exercise
                      {blockExercises !== 1 ? "s" : ""}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.08em] [color:color-mix(in_oklab,var(--blocks-muted)_74%,black)]">
                      Created {dayjs(block.createdAt).format("MMM D, YYYY")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/app/coach/blocks/${block.id}`)
                      }
                      className="rounded-xl border font-semibold [border-color:#4a4a4a] [background:var(--blocks-accent)] [color:#101010] hover:[background:var(--blocks-accent-2)]"
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
                          className="rounded-xl border [border-color:var(--blocks-border)] [background:transparent] hover:[background:rgba(255,255,255,0.08)]"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
