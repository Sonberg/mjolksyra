"use client";

import { User, UserTrainee } from "@/services/users/type";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";
import { useState } from "react";
import { AthleteDashboard } from "./AthleteDashboard";
import { AthleteTransactions } from "./AthleteTransactions";
import { AthleteSettings } from "./AthleteSettings";
import { AthleteCoaches } from "./AthleteCoaches";
import { AthleteSectionTabs } from "./AthleteSectionTabs";

type Props = {
  user: User;
  initialCoachTraineeId?: string;
  focusWorkoutId?: string;
  detailWorkoutId?: string;
  detailBackTab?: "past" | "future";
  initialWorkoutTab?: "past" | "future";
  view?: "workouts" | "transactions" | "settings";
};

export function PageContent({
  user,
  initialCoachTraineeId,
  focusWorkoutId,
  detailWorkoutId,
  detailBackTab,
  initialWorkoutTab,
  view = "workouts",
}: Props) {
  const [coach, setCoach] = useState<UserTrainee | null>(
    user.coaches.find((x) => x.traineeId === initialCoachTraineeId) ??
      user.coaches[0],
  );
  const needsOnboarding = user.onboarding.athlete !== "Completed" || false;
  const athleteName = user.givenName || "Athlete";
  const hasCoachData = user.coaches.length > 0 || user.invitations.length > 0;

  return (
    <div className="relative w-full space-y-8 pb-8 md:pb-10">
      {needsOnboarding ? (
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 md:px-6">
          <section className="relative overflow-hidden rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 md:p-10">
            <div className="pointer-events-none absolute left-12 top-16 h-px w-32 bg-[var(--shell-border)]/40" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--shell-muted)]">
                  Athlete
                </p>
                <h1 className="font-[var(--font-display)] text-3xl tracking-tight text-[var(--shell-ink)] md:text-4xl">
                  {athleteName}
                </h1>
                <p className="max-w-2xl text-sm text-[var(--shell-muted)] md:text-base">
                  Accept your coach invitation and prepare billing setup to get started.
                </p>
              </div>
              <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                  Pending invitations
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--shell-ink)]">
                  {user.invitations.length}
                </p>
              </div>
            </div>
          </section>

          {hasCoachData ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <AthleteCoaches user={user} selected={coach} onSelect={setCoach} />
              </div>
              <div className="lg:col-span-8">
                <AthleteOnboardingFlow hasCoachContext />
              </div>
            </div>
          ) : (
            <AthleteOnboardingFlow hasCoachContext={false} />
          )}
        </div>
      ) : (
        <>
          {coach ? (
            <div className="sticky top-0 z-40 w-full border-b-2 border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface),transparent_10%)] py-2 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--shell-surface),transparent_6%)]">
              <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
                <AthleteSectionTabs
                  traineeId={coach.traineeId}
                  coaches={user.coaches}
                  onCoachChange={setCoach}
                />
              </div>
            </div>
          ) : null}
          <div className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6 md:pt-16">
            {coach ? (
              view === "workouts" ? (
                <AthleteDashboard
                  coach={coach}
                  focusWorkoutId={focusWorkoutId}
                  detailWorkoutId={detailWorkoutId}
                  detailBackTab={detailBackTab}
                  initialWorkoutTab={initialWorkoutTab}
                />
              ) : view === "transactions" ? (
                <AthleteTransactions coach={coach} />
              ) : (
                <AthleteSettings coach={coach} />
              )
            ) : (
              <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-8 text-center">
                <p className="text-lg font-semibold text-[var(--shell-ink)]">
                  No active coach selected
                </p>
                <p className="mt-2 text-sm text-[var(--shell-muted)]">
                  Accept an invitation or choose a coach to see your training
                  program.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
