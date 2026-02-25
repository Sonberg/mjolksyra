"use client";

import Link from "next/link";
import { ArrowRightIcon, Layers3Icon } from "lucide-react";

const previewWeeks = [
  { week: "Week 1", focus: "Foundation", sessions: ["Squat", "Bench", "Pull"] },
  {
    week: "Week 2",
    focus: "Build",
    sessions: ["Volume", "Power", "Accessories"],
  },
  {
    week: "Week 3",
    focus: "Peak",
    sessions: ["Heavy Singles", "Speed Work", "Technique"],
  },
  {
    week: "Week 4",
    focus: "Deload",
    sessions: ["Recovery", "Mobility", "Low Intensity"],
  },
];

export function BlockBuilderPreviewSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
              <Layers3Icon className="h-3.5 w-3.5" />
              New Preview
            </p>
            <h2 className="font-[var(--font-display)] bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
              Build Multi-Week Training Blocks
            </h2>
            <p className="mt-3 max-w-2xl text-base text-zinc-400">
              Plan progression week by week and keep athlete workloads aligned
              from foundation to deload.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {previewWeeks.map((item) => (
              <article
                key={item.week}
                className="rounded-xl border border-zinc-800 bg-black/50 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-zinc-100">
                    {item.week}
                  </h3>
                  <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-300">
                    {item.focus}
                  </span>
                </div>
                <div className="space-y-2">
                  {item.sessions.map((session) => (
                    <div
                      key={session}
                      className="rounded-lg border border-white/10 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200"
                    >
                      {session}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
