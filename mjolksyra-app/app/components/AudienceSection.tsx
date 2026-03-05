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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--home-muted)]">
            Who It&apos;s For
          </p>
          <h2 className="font-[var(--font-display)] mt-3 text-3xl text-[var(--home-text)] md:text-4xl">
            Built for coaches in performance and strength
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {audiences.map((audience) => (
            <article
              key={audience.title}
              className="rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-6 transition-colors hover:bg-[var(--home-surface-strong)]"
            >
              <div className="mb-4 inline-flex rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] p-2.5">
                <audience.icon className="h-5 w-5 text-[var(--home-text)]" />
              </div>
              <h3 className="text-xl text-[var(--home-text)]">{audience.title}</h3>
              <p className="mt-1 text-sm font-medium text-[var(--home-muted)]">
                {audience.subtitle}
              </p>
              <p className="mt-4 text-[var(--home-muted)]">{audience.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
