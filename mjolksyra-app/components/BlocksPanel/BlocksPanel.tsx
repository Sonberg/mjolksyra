"use client";

import { useQuery } from "@tanstack/react-query";
import { useDraggable } from "@dnd-kit/core";
import { useId } from "react";
import { GripVertical, Layers } from "lucide-react";
import Link from "next/link";

import { GetBlocks } from "@/services/blocks/getBlocks";
import { Block } from "@/services/blocks/type";
import { Spinner } from "../Spinner";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

type BlockItemProps = {
  block: Block;
};

const dayLabelByIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function renderPreview(block: Block) {
  const validWorkouts = block.workouts.filter(
    (x) => x.week >= 1 && x.week <= block.numberOfWeeks && x.dayOfWeek >= 1 && x.dayOfWeek <= 7
  );

  if (validWorkouts.length === 0) {
    return <p className="text-xs text-[var(--shell-muted)]">No workouts in this block yet.</p>;
  }

  const grouped = new Map<number, Map<number, string[]>>();
  for (const workout of validWorkouts) {
    if (!grouped.has(workout.week)) {
      grouped.set(workout.week, new Map<number, string[]>());
    }

    const week = grouped.get(workout.week)!;
    week.set(
      workout.dayOfWeek,
      workout.exercises.map((x) => x.name)
    );
  }

  const sortedWeeks = [...grouped.entries()].sort((a, b) => a[0] - b[0]).slice(0, 4);

  return (
    <div className="flex flex-col gap-2">
      {sortedWeeks.map(([weekNumber, days]) => {
        const sortedDays = [...days.entries()].sort((a, b) => a[0] - b[0]).slice(0, 4);
        return (
          <div key={weekNumber} className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-2">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
              Week {weekNumber}
            </p>
            <div className="flex flex-col gap-1">
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
      {grouped.size > 4 ? (
        <p className="text-[11px] text-[var(--shell-muted)]">+{grouped.size - 4} more week(s)</p>
      ) : null}
    </div>
  );
}

function BlockItem({ block }: BlockItemProps) {
  const id = useId();
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: block.id + id,
    data: {
      type: "block",
      block,
      label: block.name,
    },
  });

  return (
    <HoverCard openDelay={250}>
      <HoverCardTrigger asChild>
        <div
          ref={setNodeRef}
          className="flex cursor-move select-none items-center gap-2 border-b border-[var(--shell-border)]/20 px-1 py-2 hover:bg-[var(--shell-surface-strong)]"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4 shrink-0 text-[var(--shell-muted)]" />
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium text-[var(--shell-ink)]">{block.name}</div>
            <div className="text-xs text-[var(--shell-muted)]">
              {block.numberOfWeeks} week{block.numberOfWeeks !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        className="z-50 w-80 border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]"
      >
        <div className="mb-2">
          <p className="text-sm font-semibold text-[var(--shell-ink)]">{block.name}</p>
          <p className="text-xs text-[var(--shell-muted)]">
            {block.numberOfWeeks} week{block.numberOfWeeks !== 1 ? "s" : ""}
          </p>
        </div>
        {renderPreview(block)}
      </HoverCardContent>
    </HoverCard>
  );
}

type Props = {
  getBlocks: GetBlocks;
};

export function BlocksPanel({ getBlocks }: Props) {
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["blocks"],
    queryFn: getBlocks,
  });

  if (isLoading) {
    return (
      <div className="p-4 grid place-items-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="m-4 rounded-none border border-dashed border-[var(--shell-border)] p-6 text-center">
        <Layers className="mx-auto mb-3 h-6 w-6 text-[var(--shell-muted)]" />
        <p className="text-sm font-medium text-[var(--shell-ink)]">No blocks yet</p>
        <p className="mt-1 text-xs text-[var(--shell-muted)]">
          Create a block to start building workout plans.
        </p>
        <Link
          href="/app/coach/blocks"
          className="mt-3 inline-block text-xs underline text-[var(--shell-muted)] hover:text-[var(--shell-ink)]"
        >
          Go to Blocks
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-2 font-bold text-[var(--shell-ink)]">Blocks</div>
      <div>
        {blocks.map((block) => (
          <BlockItem key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
