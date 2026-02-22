"use client";

import { User } from "@/services/users/type";
import { CoachOnboarding } from "./CoachOnboarding";
import { Trainee } from "@/services/trainees/type";
import { CoachDashboard } from "./CoachDashboard";

type Props = { trainees: Trainee[]; user: User };

export function PageContent({ trainees, user }: Props) {
  const coachName = user.givenName || user.name || "Coach";
  const onboardingComplete = user.onboarding.coach === "Completed";

  return (
    <div className="relative space-y-8 py-6 md:py-10">
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-48 -left-24 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-6 py-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:px-10">
        <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute -bottom-20 left-20 h-52 w-52 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Coach workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Welcome back, {coachName}
            </h1>
            <p className="max-w-2xl text-sm text-zinc-300 md:text-base">
              Manage athletes, track engagement, and keep your weekly coaching
              flow organized.
            </p>
          </div>

          {onboardingComplete ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                Active athletes
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {trainees.length}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {onboardingComplete ? (
        <CoachDashboard trainees={trainees} />
      ) : (
        <CoachOnboarding user={user} />
      )}
    </div>
  );
}
