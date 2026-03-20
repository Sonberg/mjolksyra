"use client";

import { User, UserTrainee } from "@/services/users/type";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";
import { useState, Suspense } from "react";
import { AthleteDashboard } from "./AthleteDashboard";
import { AthleteTransactions } from "./AthleteTransactions";
import { AthleteSettings } from "./AthleteSettings";
import { AthleteCoaches } from "./AthleteCoaches";
import { AthleteSectionTabs } from "./AthleteSectionTabs";
import { PageLayout } from "@/app/components/PageLayout";

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
  const hasCoachData = user.coaches.length > 0 || user.invitations.length > 0;
  const [coach, setCoach] = useState<UserTrainee | null>(
    user.coaches.find((x) => x.traineeId === initialCoachTraineeId) ??
      user.coaches[0] ??
      null,
  );
  const needsOnboarding =
    user.onboarding.athlete !== "Completed" || !hasCoachData;
  const shouldShowInviteOnboarding = !coach && user.invitations.length > 0;
  const isPaymentSetupComplete = user.onboarding.athlete === "Completed";
  const athleteName = user.givenName || "Athlete";

  if (needsOnboarding || shouldShowInviteOnboarding) {
    return (
      <PageLayout>
        <div className="space-y-6 px-4 pb-8 md:space-y-8 md:px-6 md:pb-10">
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
                  Accept your coach invitation and prepare billing setup to get
                  started.
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
              <div className="lg:col-span-5">
                <AthleteCoaches
                  user={user}
                  selected={coach}
                  onSelect={setCoach}
                />
              </div>
              {isPaymentSetupComplete ? (
                <section className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 lg:col-span-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                    Status
                  </p>
                  <h2 className="mt-2 text-2xl text-[var(--shell-ink)]">
                    You are ready to start
                  </h2>
                  <p className="mt-2 text-sm text-[var(--shell-muted)]">
                    Payment setup is complete. Accept your invitation and your coach
                    workspace will become active automatically.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                        1
                      </p>
                      <p className="mt-1 text-sm text-[var(--shell-ink)]">
                        Accept invitation
                      </p>
                    </div>
                    <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                        2
                      </p>
                      <p className="mt-1 text-sm text-[var(--shell-ink)]">
                        Coach connection activates
                      </p>
                    </div>
                    <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                        3
                      </p>
                      <p className="mt-1 text-sm text-[var(--shell-ink)]">
                        Workouts appear in your dashboard
                      </p>
                    </div>
                  </div>
                </section>
              ) : (
                <div className="lg:col-span-7">
                  <Suspense>
                    <AthleteOnboardingFlow
                      hasCoachContext
                      isPaymentSetupComplete={isPaymentSetupComplete}
                    />
                  </Suspense>
                </div>
              )}
            </div>
          ) : (
            <Suspense>
            <AthleteOnboardingFlow
              hasCoachContext={false}
              isPaymentSetupComplete={isPaymentSetupComplete}
            />
          </Suspense>
          )}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      navigation={
        coach
          ? {
              tabs: (
                <AthleteSectionTabs
                  traineeId={coach.traineeId}
                  coaches={user.coaches}
                  onCoachChange={setCoach}
                />
              ),
            }
          : undefined
      }
    >
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
            Accept an invitation or choose a coach to see your training program.
          </p>
        </div>
      )}
    </PageLayout>
  );
}
