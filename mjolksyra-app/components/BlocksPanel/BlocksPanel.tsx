"use client";

import { useQuery } from "@tanstack/react-query";
import { useDraggable } from "@dnd-kit/core";
import { useId } from "react";
import { GripVertical } from "lucide-react";

import { GetBlocks } from "@/services/blocks/getBlocks";
import { Block } from "@/services/blocks/type";
import { Spinner } from "../Spinner";

type BlockItemProps = {
  block: Block;
};

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
