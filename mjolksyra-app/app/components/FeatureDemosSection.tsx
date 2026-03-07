"use client";

import { BarChart3Icon, ClipboardCheckIcon, LayoutGridIcon } from "lucide-react";

export function FeatureDemosSection() {
  return (
    <section id="product-proof" className="py-20 lg:py-28">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--home-muted)]">
            Product proof
          </p>
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--home-text)] md:text-4xl">
            See the core coaching workflows
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--home-muted)]">
            No fluff. These are the exact parts coaches use every week to plan,
            review, and progress clients.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <article className="border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-5">
            <div className="mb-4 inline-flex items-center gap-2 border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
              <LayoutGridIcon className="h-3.5 w-3.5" />
              Program builder
            </div>
            <div className="border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] p-3">
              <div className="mb-2 grid grid-cols-3 gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--home-muted)]">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-[var(--home-text)]">
                <div className="border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-2">Squat 5x5</div>
                <div className="border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-2">Bench 6x4</div>
                <div className="border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-2">Deadlift 5x3</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--home-muted)]">
              Build week plans fast with drag-and-drop exercises.
            </p>
          </article>

          <article className="border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-5">
            <div className="mb-4 inline-flex items-center gap-2 border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
              <BarChart3Icon className="h-3.5 w-3.5" />
              Progress tracking
            </div>
            <div className="border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] p-3">
              <div className="mb-2 flex items-end gap-1.5">
                {[35, 46, 52, 61, 72, 83].map((h, index) => (
                  <div
                    key={`progress-bar-${index}`}
                    className="w-full border-2 border-[var(--home-border)] bg-[var(--home-accent)]"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--home-muted)]">
                Last 6 sessions load trend
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--home-muted)]">
              Track progression and spot athletes that need follow-up.
            </p>
          </article>

          <article className="border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-5">
            <div className="mb-4 inline-flex items-center gap-2 border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]">
              <ClipboardCheckIcon className="h-3.5 w-3.5" />
              Feedback workflow
            </div>
            <div className="space-y-2 border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] p-3">
              <div className="border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-2 text-xs text-[var(--home-text)]">
                Athlete: “Front squat felt heavy at top set.”
              </div>
              <div className="border-2 border-[var(--home-border)] bg-[var(--home-accent)] p-2 text-xs font-semibold text-[var(--home-accent-ink)]">
                Coach: “Drop 2.5 kg next set and keep tempo controlled.”
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--home-muted)]">
              Review workouts and coach directly from completed sessions.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
