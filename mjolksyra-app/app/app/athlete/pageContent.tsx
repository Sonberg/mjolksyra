"use client";

import { User, UserTrainee } from "@/services/users/type";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
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
        <div className="space-y-8 px-4 pb-8 md:px-6 md:pb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <PageSectionHeader
              eyebrow="Athlete"
              title={athleteName}
              description="Accept your coach invitation and prepare billing setup to get started."
            />
            {user.invitations.length > 0 ? (
              <div className="shrink-0 bg-[var(--shell-surface-strong)] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Pending invitations</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--shell-ink)]">{user.invitations.length}</p>
              </div>
            ) : null}
          </div>

          {hasCoachData ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <AthleteCoaches user={user} selected={coach} onSelect={setCoach} />
              </div>
              {isPaymentSetupComplete ? (
                <div className="space-y-4 lg:col-span-7">
                  <PageSectionHeader
                    eyebrow="Status"
                    title="You are ready to start"
                    description="Payment setup is complete. Accept your invitation and your coach workspace will become active automatically."
                    titleClassName="text-xl md:text-2xl"
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="bg-[var(--shell-surface-strong)] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Step 1</p>
                      <p className="mt-2 text-sm text-[var(--shell-ink)]">Accept invitation</p>
                    </div>
                    <div className="bg-[var(--shell-surface-strong)] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Step 2</p>
                      <p className="mt-2 text-sm text-[var(--shell-ink)]">Coach connection activates</p>
                    </div>
                    <div className="bg-[var(--shell-surface-strong)] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Step 3</p>
                      <p className="mt-2 text-sm text-[var(--shell-ink)]">Workouts appear in your dashboard</p>
                    </div>
                  </div>
                </div>
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
      fullBleed={!!detailWorkoutId}
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
        <div className="py-8 text-center">
          <p className="text-lg font-semibold text-[var(--shell-ink)]">No active coach selected</p>
          <p className="mt-2 text-sm text-[var(--shell-muted)]">Accept an invitation or choose a coach to see your training program.</p>
        </div>
      )}
    </PageLayout>
  );
}
