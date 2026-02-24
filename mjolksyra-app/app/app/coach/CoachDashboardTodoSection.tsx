"use client";

import { cn } from "@/lib/utils";
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
    <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Coach to-do
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
          Follow-ups
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Payment blockers, feedback follow-ups, and planning gaps to review.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="rounded-[1.25rem] border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 rounded-lg border p-2", item.tone)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.text}</p>
                    {item.names && (
                      <p className="mt-2 text-xs text-zinc-500">{item.names}</p>
                    )}
                  </div>
                </div>
                <div className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs font-semibold text-zinc-300">
                  {item.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
