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
    <div className="relative space-y-8 py-6 md:py-10">
      <div className="pointer-events-none absolute -top-20 -left-16 h-56 w-56 rounded-full bg-white/8 blur-3xl" />
      <div className="pointer-events-none absolute top-56 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      {needsOnboarding ? (
        <AthleteOnboardingFlow />
      ) : (
        <>
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:px-10">
            <div className="absolute -right-8 -top-16 h-52 w-52 rounded-full bg-white/8 blur-3xl" />
            <div className="absolute -bottom-20 left-20 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="font-[var(--font-display)] text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                  Athlete dashboard
                </p>
                <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Welcome back, {athleteName}
                </h1>
                <p className="max-w-2xl text-sm text-zinc-300 md:text-base">
                  Review your training plan, stay synced with your coach, and
                  keep progress visible week to week.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
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
                <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-8 text-center">
                  <p className="text-lg font-semibold text-white">
                    No active coach selected
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
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
