"use client";

import { User, UserTrainee } from "@/services/users/type";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";
import { useState } from "react";
import { AthleteDashboard } from "./AthleteDashboard";
import { AthleteCoaches } from "./AthleteCoaches";

type Props = {
  user: User;
};

export function PageContent({ user }: Props) {
  const [coach, setCoach] = useState<UserTrainee | null>(user.coaches[0]);
  const needsOnboarding = user.onboarding.athlete !== "Completed" || false;
  const athleteName = user.givenName || user.name || "Athlete";

  return (
    <div className="relative space-y-8">
      <div className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 -rotate-6 rounded-[1.25rem] border border-zinc-800 bg-white/[0.02]" />
      <div className="pointer-events-none absolute top-24 right-0 h-48 w-48 rotate-12 rounded-[1.5rem] border border-zinc-800 bg-white/[0.02]" />

      {needsOnboarding ? (
        <AthleteOnboardingFlow />
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 md:p-10">
            <div className="pointer-events-none absolute -right-24 -top-10 h-40 w-40 rotate-12 rounded-[1.5rem] border border-zinc-800 bg-white/[0.02]" />
            <div className="pointer-events-none absolute left-12 top-16 h-px w-32 bg-zinc-800" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Athlete
                </p>
                <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {athleteName}
                </h1>
                <p className="max-w-2xl text-sm text-zinc-400 md:text-base">
                  Review workouts, billing, and coach communication in one
                  place.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-900 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Active coaches
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {user.coaches.length}
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <AthleteCoaches user={user} selected={coach} onSelect={setCoach} />
            </div>
            <div className="lg:col-span-8">
              {coach ? (
                <AthleteDashboard coach={coach} />
              ) : (
                <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-8 text-center">
                  <p className="text-lg font-semibold text-white">
                    No active coach selected
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Accept an invitation or choose a coach to see your training
                    program.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
