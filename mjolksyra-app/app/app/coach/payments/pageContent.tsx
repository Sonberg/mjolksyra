"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/services/client";
import { User } from "@/services/users/type";
import { Trainee } from "@/services/trainees/type";
import { getPlans } from "@/services/plans/getPlans";
import type { Plan } from "@/services/plans/type";
import { CoachDashboardSubscriptionSection } from "../CoachDashboardSubscriptionSection";

const STARTER_FALLBACK: Plan = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Starter",
  monthlyPriceSek: 199,
  includedAthletes: 5,
  extraAthletePriceSek: 49,
  sortOrder: 1,
};

type Props = {
  user: User;
  trainees: Trainee[];
};

export function PaymentsPageContent({ user, trainees }: Props) {
  const [isOpeningStripe, setIsOpeningStripe] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
  });

  const currentPlan =
    plans.find((p) => p.id === user.onboarding.coachPlanId) ??
    plans.find((p) => p.id === STARTER_FALLBACK.id) ??
    STARTER_FALLBACK;

  const overageAthletes = Math.max(0, trainees.length - currentPlan.includedAthletes);

  const openStripeDashboard = useCallback(async () => {
    setIsOpeningStripe(true);
    try {
      const { data } = await ApiClient.get<{ url: string }>("/api/stripe/dashboard");
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } finally {
      setIsOpeningStripe(false);
    }
  }, []);

  const coachPaymentStatus =
    user.onboarding.coach === "Completed"
      ? {
          label: "Stripe connected",
          text: "Payouts and coach billing setup are active.",
          badgeClass: "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        }
      : user.onboarding.coach === "Started"
        ? {
            label: "Setup in progress",
            text: "Complete your Stripe onboarding to enable coach billing and payouts.",
            badgeClass: "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
          }
        : {
            label: "Not connected",
            text: "Connect Stripe to receive payouts and manage coach billing settings.",
            badgeClass: "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)]",
          };

  return (
    <CoachDashboardSubscriptionSection
      coachPaymentStatus={coachPaymentStatus}
      currentPlan={currentPlan}
      plans={plans}
      overageAthletes={overageAthletes}
      athleteCount={trainees.length}
      isOpeningStripe={isOpeningStripe}
      onOpenStripeDashboard={openStripeDashboard}
      trialEndsAt={user.onboarding.coachTrialEndsAt ?? null}
    />
  );
}
