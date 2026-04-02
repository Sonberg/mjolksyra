"use client";

import { CalendarHeartIcon } from "lucide-react";

type Props = {
  onClick: () => void;
};

export function TodayButton({ onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="absolute bottom-8 right-8 grid h-10 w-10 cursor-pointer place-items-center rounded-none border border-transparent bg-[var(--shell-accent)] text-sm font-bold text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent-hover)]"
    >
      <CalendarHeartIcon className="h-4" />
    </div>
  );
}
