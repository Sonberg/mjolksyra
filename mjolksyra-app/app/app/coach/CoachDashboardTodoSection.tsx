"use client";

import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { LucideIcon } from "lucide-react";

export type CoachTodoItem = {
  key: string;
  title: string;
  text: string;
  names: string | null;
  count: number;
  icon: LucideIcon;
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
          const active = item.count > 0;
          return (
            <div
              key={item.key}
              className="bg-[var(--shell-surface-strong)] p-4"
              style={active ? { borderLeft: "2px solid var(--shell-accent)" } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 shrink-0 border border-[var(--shell-border)] bg-[var(--shell-surface)] p-1.5"
                    style={{ color: active ? "var(--shell-accent)" : "var(--shell-muted)" }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: active ? "var(--shell-ink)" : "var(--shell-muted)" }}
                    >
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--shell-muted)]">
                      {item.text}
                    </p>
                    {item.names && (
                      <p className="mt-2 text-xs text-[var(--shell-muted)]">
                        {item.names}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className="shrink-0 text-sm font-semibold tabular-nums"
                  style={{ color: active ? "var(--shell-ink)" : "var(--shell-muted)" }}
                >
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
