"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { MoveIcon, CopyIcon, TrashIcon } from "lucide-react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { createPortal } from "react-dom";

type Props = {
  header: "Exercise" | "Day" | "Week";
  icon: ReactNode;
  listeners: SyntheticListenerMap | undefined;
  onDelete: () => void;
  label?: string;
};

export function DraggingToolTip({
  header,
  icon,
  listeners,
  onDelete,
  label,
}: Props) {
  const [isHovering, setHover] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const showTimerRef = useRef<number | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const clearShowTimer = () => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };

  const openTooltip = () => {
    clearHideTimer();
    clearShowTimer();
    setHover(true);
  };

  const openTooltipSoon = () => {
    clearHideTimer();
    clearShowTimer();
    showTimerRef.current = window.setTimeout(() => {
      setHover(true);
      showTimerRef.current = null;
    }, 400);
  };

  const closeTooltipSoon = () => {
    clearHideTimer();
    clearShowTimer();
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
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isHovering) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const estimatedHeight = label ? 96 : 48;
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
  }, [isHovering, label]);

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={openTooltipSoon}
      onMouseLeave={closeTooltipSoon}
      onClick={openTooltip}
    >
      {icon ? <span className="cursor-pointer">{icon}</span> : null}
      {isHovering && typeof window !== "undefined" && position
        ? createPortal(
            <div
              className="fixed z-[80] min-w-44 max-w-80 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-2 shadow-[0_12px_30px_rgba(42,36,29,0.25)]"
              style={{
                top: position.top,
                left: position.left,
                transform: "translateX(-50%)",
              }}
              onMouseEnter={openTooltip}
              onMouseLeave={closeTooltipSoon}
            >
              {label ? (
                <div className="mb-2 border-b border-[var(--shell-border)] px-1 pb-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                    {header}
                  </div>
                  <div className="break-words pt-1 text-sm font-semibold leading-tight text-[var(--shell-ink)]">
                    {label}
                  </div>
                </div>
              ) : null}
              <div
                onClick={(ev) => ev.preventDefault()}
                className="flex items-center gap-2 px-1"
              >
                <MoveIcon
                  {...listeners}
                  data-action="move"
                  className="h-8 w-8 cursor-move border border-[var(--shell-border)] p-2 text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
                />
                <CopyIcon
                  {...listeners}
                  data-action="clone"
                  className="h-8 w-8 cursor-copy border border-[var(--shell-border)] p-2 text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
                />
                <TrashIcon
                  onClick={onDelete}
                  className="h-8 w-8 cursor-pointer border border-[var(--shell-border)] p-2 text-[var(--shell-accent)] transition hover:brightness-90"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
