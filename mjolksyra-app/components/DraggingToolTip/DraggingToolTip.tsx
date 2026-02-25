"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { MoveIcon, CopyIcon, TrashIcon } from "lucide-react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { createPortal } from "react-dom";

type Props = {
  icon: ReactNode;
  listeners: SyntheticListenerMap | undefined;
  onDelete: () => void;
};

export function DraggingToolTip({ icon, listeners, onDelete }: Props) {
  const [isHovering, setHover] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const openTooltip = () => {
    clearHideTimer();
    setHover(true);
  };

  const closeTooltipSoon = () => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setHover(false);
      hideTimerRef.current = null;
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isHovering) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const estimatedHeight = 38;
      const topAbove = rect.top - estimatedHeight - 8;
      const topBelow = rect.bottom + 8;
      const top = topAbove < 8 ? topBelow : topAbove;

      setPosition({
        top,
        left: rect.left + rect.width / 2,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isHovering]);

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltipSoon}
    >
      {icon}
      {isHovering && typeof window !== "undefined" && position
        ? createPortal(
        <div
          className="fixed z-[80] rounded border border-zinc-700 bg-zinc-950 py-2 px-1 shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
          style={{
            top: position.top,
            left: position.left,
            transform: "translateX(-50%)",
          }}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltipSoon}
        >
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
        </div>,
        document.body,
      )
        : null}
    </div>
  );
}
