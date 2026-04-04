"use client";

import { cn } from "@/lib/utils";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { LucideIcon } from "lucide-react";

export type CoachTodoItem = {
  key: string;
  title: string;
  text: string;
  names: string | null;
  count: number;
  icon: LucideIcon;
  tone: string;
};

type Props = {
  items: CoachTodoItem[];
};

export function CoachDashboardTodoSection({ items }: Props) {
  return (
    <div className="space-y-4">
      <PageSectionHeader
        eyebrow="Coach to-do"
        title="Follow-ups"
        description="Payment blockers, feedback follow-ups, and planning gaps to review."
        titleClassName="text-2xl md:text-3xl"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="bg-[var(--shell-surface-strong)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 shrink-0 p-2", item.tone)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--shell-ink)]">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--shell-muted)]">{item.text}</p>
                    {item.names && (
                      <p className="mt-2 text-xs text-[var(--shell-muted)]">{item.names}</p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[var(--shell-ink)]">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
