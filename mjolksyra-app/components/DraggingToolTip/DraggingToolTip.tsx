"use client";

import { ReactNode, useState } from "react";
import { MoveIcon, CopyIcon, TrashIcon } from "lucide-react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

type Props = {
  icon: ReactNode;
  listeners: SyntheticListenerMap | undefined;
  onDelete: () => void;
};

export function DraggingToolTip({ icon, listeners, onDelete }: Props) {
  const [isHovering, setHover] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {icon}
      {isHovering ? (
        <div className="absolute bg-background border rounded py-2 px-1 top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
          <div
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
