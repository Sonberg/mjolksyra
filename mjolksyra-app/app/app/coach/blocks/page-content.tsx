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
import { CoachWorkspaceShell } from "../CoachWorkspaceShell";

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
      <section className="relative overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-7">
        <div className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rotate-12 rounded-[1.25rem] border border-zinc-800 bg-white/[0.02]" />
        <div className="pointer-events-none absolute left-10 top-16 h-px w-28 bg-zinc-800" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Block management
            </p>
            <h1 className="text-2xl font-semibold text-white md:text-3xl">
              Training Blocks
            </h1>
            <p className="max-w-2xl text-sm text-zinc-400">
              Build reusable training plans and organize sessions week by week.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-100 px-5 py-2 font-semibold text-black transition hover:bg-zinc-300 disabled:opacity-60"
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">Total blocks</p>
            <Layers3Icon className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">
            {sortedBlocks.length}
          </p>
        </div>
        <div
          className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5"
          style={{ animationDelay: "90ms" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">Planned sessions</p>
            <CalendarRangeIcon className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">
            {totalWorkouts}
          </p>
        </div>
        <div
          className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">Exercises in blocks</p>
            <DumbbellIcon className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">
            {totalExercises}
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-[1.25rem] border border-zinc-800 bg-zinc-950 blocks-pulse"
            />
          ))}
        </div>
      ) : sortedBlocks.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-zinc-800 bg-zinc-950 px-6 py-16 text-center">
          <p className="text-xl font-semibold text-white">
            No blocks yet
          </p>
          <p className="mt-2 text-base text-zinc-500">
            Create your first training block and start planning week-by-week.
          </p>
          <Button
            onClick={handleCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-100 px-5 py-2 font-semibold text-black transition hover:bg-zinc-300"
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
                className="group rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 transition hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-white">
                        {block.name}
                      </h2>
                      <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                        {block.numberOfWeeks} week
                        {block.numberOfWeeks !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                      {block.workouts.length} workout
                      {block.workouts.length !== 1 ? "s" : ""} ·{" "}
                      {blockExercises} exercise
                      {blockExercises !== 1 ? "s" : ""}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.08em] text-zinc-500">
                      Created {dayjs(block.createdAt).format("MMM D, YYYY")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/app/coach/blocks/${block.id}`)
                      }
                      className="rounded-xl border border-zinc-700 bg-zinc-100 font-semibold text-black hover:bg-zinc-300"
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
                          className="rounded-xl border border-zinc-800 bg-transparent hover:bg-zinc-900"
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
    </CoachWorkspaceShell>
  );
}
