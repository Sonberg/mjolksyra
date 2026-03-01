"use client";

import { useQuery } from "@tanstack/react-query";
import { useDraggable } from "@dnd-kit/core";
import { useId } from "react";
import { GripVertical } from "lucide-react";

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
    return <p className="text-xs text-zinc-400">No workouts in this block yet.</p>;
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
    <div className="space-y-2">
      {sortedWeeks.map(([weekNumber, days]) => {
        const sortedDays = [...days.entries()].sort((a, b) => a[0] - b[0]).slice(0, 4);
        return (
          <div key={weekNumber} className="rounded-md border border-zinc-800 bg-zinc-900/70 p-2">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-300">
              Week {weekNumber + 1}
            </p>
            <div className="space-y-1">
              {sortedDays.map(([dayIndex, exercises]) => (
                <p key={dayIndex} className="text-xs text-zinc-200">
                  <span className="mr-1 text-zinc-400">
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
        <p className="text-[11px] text-zinc-400">+{grouped.size - 4} more week(s)</p>
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
          className="flex items-center gap-2 border-b py-2 px-1 hover:bg-accent/50 cursor-move select-none"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{block.name}</div>
            <div className="text-xs text-muted-foreground">
              {block.numberOfWeeks} week{block.numberOfWeeks !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        className="z-50 w-80 border-zinc-700 bg-zinc-950 text-zinc-100"
      >
        <div className="mb-2">
          <p className="text-sm font-semibold text-zinc-100">{block.name}</p>
          <p className="text-xs text-zinc-400">
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
      <div className="p-4 text-sm text-muted-foreground text-center">
        No blocks yet. Create one at{" "}
        <a href="/app/coach/blocks" className="underline">
          /app/coach/blocks
        </a>
        .
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="font-bold mb-2">Blocks</div>
      <div>
        {blocks.map((block) => (
          <BlockItem key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
