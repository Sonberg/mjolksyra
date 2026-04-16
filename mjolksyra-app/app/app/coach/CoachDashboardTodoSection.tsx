"use client";

import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { ArrowRightIcon, LucideIcon } from "lucide-react";
import Link from "next/link";

export type CoachTodoItem = {
  key: string;
  title: string;
  text: string;
  athletes: { name: string; href: string }[];
  count: number;
  icon: LucideIcon;
  href?: string;
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
          const cardContent = (
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
                  {item.athletes.length > 0 && (
                    <p className="mt-2 text-xs">
                      {item.athletes.map((athlete, i) => (
                        <span key={athlete.href}>
                          {i > 0 && <span className="text-[var(--shell-muted)]">, </span>}
                          <Link
                            href={athlete.href}
                            className="text-[var(--shell-accent)] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {athlete.name}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: active ? "var(--shell-ink)" : "var(--shell-muted)" }}
                >
                  {item.count}
                </span>
                {active && item.href && (
                  <ArrowRightIcon
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--shell-muted)" }}
                  />
                )}
              </div>
            </div>
          );

          if (active && item.href) {
            return (
              <Link
                key={item.key}
                href={item.href}
                className="block bg-[var(--shell-surface-strong)] p-4 transition-opacity hover:opacity-80"
                style={{ borderLeft: "2px solid var(--shell-accent)" }}
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <div
              key={item.key}
              className="bg-[var(--shell-surface-strong)] p-4"
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
