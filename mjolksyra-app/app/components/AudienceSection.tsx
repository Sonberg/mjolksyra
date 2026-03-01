"use client";

import { FlameIcon, DumbbellIcon } from "lucide-react";

const audiences = [
  {
    title: "Functional",
    subtitle: "CrossFit, HYROX",
    description:
      "Plan mixed-modal sessions, track conditioning blocks, and keep athletes consistent across strength and engine work.",
    icon: FlameIcon,
  },
  {
    title: "Strength",
    subtitle: "Bodybuilding, Powerlifting",
    description:
      "Program progressive overload, structure accessories, and deliver clear week-by-week lifting plans.",
    icon: DumbbellIcon,
  },
];

export function AudienceSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Who It&apos;s For
          </p>
          <h2 className="font-[var(--font-display)] mt-3 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
            Built for coaches in performance and strength
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {audiences.map((audience) => (
            <article
              key={audience.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 transition-colors hover:border-zinc-600"
            >
              <div className="mb-4 inline-flex rounded-lg border border-zinc-700 bg-zinc-900 p-2.5">
                <audience.icon className="h-5 w-5 text-zinc-200" />
              </div>
              <h3 className="text-xl font-semibold text-white">{audience.title}</h3>
              <p className="mt-1 text-sm font-medium text-zinc-300">
                {audience.subtitle}
              </p>
              <p className="mt-4 text-zinc-400">{audience.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
