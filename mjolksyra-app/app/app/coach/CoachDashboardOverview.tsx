"use client";

import { Trainee } from "@/services/trainees/type";
import { User } from "@/services/users/type";
import { AlertTriangleIcon, CheckCircle2Icon, MessageSquareIcon, WalletIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCredits } from "@/services/coaches/getCredits";
import { getCreditPricing } from "@/services/coaches/getCreditPricing";
import { getPlans } from "@/services/plans/getPlans";
import type { Plan } from "@/services/plans/type";
import { useState } from "react";
import { CoachDashboardMetrics } from "./CoachDashboardMetrics";
import { CoachCreditsSummaryCard } from "./CoachCreditsSummaryCard";
import {
  CoachDashboardTodoSection,
  type CoachTodoItem,
} from "./CoachDashboardTodoSection";

const STARTER_FALLBACK: Plan = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Starter",
  monthlyPriceSek: 199,
  includedAthletes: 5,
  includedCreditsPerCycle: 25,
  extraAthletePriceSek: 49,
  sortOrder: 1,
};

type Props = {
  user: User;
  trainees: Trainee[];
};

const formatNames = (items: Trainee[], limit = 3) => {
  const names = items.slice(0, limit).map((x) => x.athlete.name);
  const rest = Math.max(0, items.length - limit);
  if (names.length === 0) return null;
  return rest > 0 ? `${names.join(", ")} +${rest} more` : names.join(", ");
};

export function CoachDashboardOverview({ user, trainees }: Props) {
  const [nowMs] = useState(() => Date.now());
  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
  });
  const { data: credits } = useQuery({
    queryKey: ["coach-credits"],
    queryFn: getCredits,
  });
  const { data: creditPricing = [] } = useQuery({
    queryKey: ["coach-credit-pricing"],
    queryFn: getCreditPricing,
  });

  const currentPlan =
    plans.find((p) => p.id === user.onboarding.coachPlanId) ??
    plans.find((p) => p.id === STARTER_FALLBACK.id) ??
    STARTER_FALLBACK;

  const includedAthletes = currentPlan.includedAthletes;
  const coachPlanMonthlySek = currentPlan.monthlyPriceSek;

  const freeAthleteSpotsLeft = Math.max(0, includedAthletes - trainees.length);
  const recurringAthleteBilling = trainees.reduce((acc, trainee) => {
    if (!trainee.cost) return acc;
    return acc + trainee.cost.total;
  }, 0);
  const netAfterCoachPlan = Math.max(0, recurringAthleteBilling - coachPlanMonthlySek);

  const paymentBlocked = trainees.filter(
    (x) =>
      x.billing.status === "AwaitingAthletePaymentMethod" ||
      x.billing.status === "AwaitingCoachStripeSetup"
  );
  const needsPrice = trainees.filter((x) => !x.billing.hasPrice);
  const programEndingSoon = trainees.filter((x) => {
    if (!x.nextWorkoutAt) return true;
    const daysUntilNext =
      (new Date(x.nextWorkoutAt).getTime() - nowMs) / (1000 * 60 * 60 * 24);
    return daysUntilNext >= 0 && daysUntilNext <= 7;
  });
  const needsFeedback = trainees.filter((x) => {
    if (!x.lastWorkoutAt) return false;
    const hoursSince =
      (nowMs - new Date(x.lastWorkoutAt).getTime()) / (1000 * 60 * 60);
    return hoursSince >= 0 && hoursSince <= 72;
  });

  const todoItems: CoachTodoItem[] = [
    {
      key: "payments",
      title: "Athletes need payment setup",
      text:
        paymentBlocked.length > 0
          ? `${paymentBlocked.length} athlete${paymentBlocked.length === 1 ? "" : "s"} blocked by payment/Stripe setup.`
          : "No payment setup blockers right now.",
      names: formatNames(paymentBlocked),
      count: paymentBlocked.length,
      icon: WalletIcon,
    },
    {
      key: "feedback",
      title: "Recent workouts to review",
      text:
        needsFeedback.length > 0
          ? `${needsFeedback.length} athlete${needsFeedback.length === 1 ? "" : "s"} trained recently and may need feedback.`
          : "No recent workouts waiting for feedback.",
      names: formatNames(needsFeedback),
      count: needsFeedback.length,
      icon: MessageSquareIcon,
    },
    {
      key: "pricing",
      title: "Athletes missing price",
      text:
        needsPrice.length > 0
          ? `${needsPrice.length} athlete${needsPrice.length === 1 ? "" : "s"} need a monthly price before billing can start.`
          : "All active athletes have a price set.",
      names: formatNames(needsPrice),
      count: needsPrice.length,
      icon: AlertTriangleIcon,
    },
    {
      key: "program",
      title: "Programs ending soon",
      text:
        programEndingSoon.length > 0
          ? `${programEndingSoon.length} athlete${programEndingSoon.length === 1 ? "" : "s"} need a fresh plan or next workout soon.`
          : "No programs need renewal this week.",
      names: formatNames(programEndingSoon),
      count: programEndingSoon.length,
      icon: CheckCircle2Icon,
    },
  ];

  return (
    <div className="space-y-8">
      <CoachDashboardMetrics
        recurringAthleteBilling={recurringAthleteBilling}
        coachPlanMonthlySek={coachPlanMonthlySek}
        netAfterCoachPlan={netAfterCoachPlan}
        freeAthleteSpotsLeft={freeAthleteSpotsLeft}
        includedAthletes={includedAthletes}
      />
      <CoachCreditsSummaryCard credits={credits ?? null} creditPricing={creditPricing} />
      <CoachDashboardTodoSection items={todoItems} />
    </div>
  );
}
