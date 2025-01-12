"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoveIcon, CopyIcon, TrashIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

type Props = {
  trigger: ReactNode;
  listeners: SyntheticListenerMap | undefined;
  onDelete: () => void;
};

export function DraggingToolTip({ trigger, listeners, onDelete }: Props) {
  return (
    <Tooltip delayDuration={50}>
      <TooltipTrigger asChild onClick={(ev) => ev.preventDefault()}>
        {trigger}
      </TooltipTrigger>

      {createPortal(
        <TooltipContent
          onClick={(ev) => ev.preventDefault()}
          className="flex gap-2 px-1"
        >
          <MoveIcon
            {...listeners}
            data-action="move"
            className="h-4 cursor-move  hover:text-zinc-400"
          />
          <CopyIcon
            {...listeners}
            data-action="clone"
            className="h-4 cursor-copy hover:text-zinc-400"
          />
          <TrashIcon
            onClick={onDelete}
            className="h-4 cursor-pointer text-red-500 hover:text-red-800"
          />
        </TooltipContent>,
        document.body
      )}
    </Tooltip>
  );
}
