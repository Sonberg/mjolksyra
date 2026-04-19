"use client";

import { CalendarHeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onClick: () => void;
};

export function TodayButton({ onClick }: Props) {
  return (
    <Button
      onClick={onClick}
      className="absolute bottom-8 right-8 size-10 rounded-none border border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent-hover)]"
      size="icon"
    >
      <CalendarHeartIcon data-icon />
    </Button>
  );
}
