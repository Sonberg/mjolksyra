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
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";

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

const formatAthletes = (
  items: Trainee[],
  hrefFn: (id: string) => string,
  limit = 3
): { name: string; href: string }[] => {
  const shown = items.slice(0, limit).map((x) => ({
    name: x.athlete.name,
    href: hrefFn(x.id),
  }));
  const rest = Math.max(0, items.length - limit);
  if (rest > 0) {
    shown.push({ name: `+${rest} more`, href: "/app/coach/athletes" });
  }
  return shown;
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
      athletes: formatAthletes(paymentBlocked, (id) => `/app/coach/athletes/${id}`),
      count: paymentBlocked.length,
      icon: WalletIcon,
      href: "/app/coach/payments",
    },
    {
      key: "feedback",
      title: "Recent workouts to review",
      text:
        needsFeedback.length > 0
          ? `${needsFeedback.length} athlete${needsFeedback.length === 1 ? "" : "s"} trained recently and may need feedback.`
          : "No recent workouts waiting for feedback.",
      athletes: formatAthletes(needsFeedback, (id) => `/app/coach/athletes/${id}/workouts`),
      count: needsFeedback.length,
      icon: MessageSquareIcon,
      href: "/app/coach/athletes",
    },
    {
      key: "pricing",
      title: "Athletes missing price",
      text:
        needsPrice.length > 0
          ? `${needsPrice.length} athlete${needsPrice.length === 1 ? "" : "s"} need a monthly price before billing can start.`
          : "All active athletes have a price set.",
      athletes: formatAthletes(needsPrice, (id) => `/app/coach/athletes/${id}`),
      count: needsPrice.length,
      icon: AlertTriangleIcon,
      href: "/app/coach/athletes",
    },
    {
      key: "program",
      title: "Programs ending soon",
      text:
        programEndingSoon.length > 0
          ? `${programEndingSoon.length} athlete${programEndingSoon.length === 1 ? "" : "s"} need a fresh plan or next workout soon.`
          : "No programs need renewal this week.",
      athletes: formatAthletes(programEndingSoon, (id) => `/app/coach/athletes/${id}/planner`),
      count: programEndingSoon.length,
      icon: CheckCircle2Icon,
      href: "/app/coach/athletes",
    },
  ];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="flex flex-col gap-8">
      <PageSectionHeader
        eyebrow="Coach workspace"
        title={`${greeting}, ${user.givenName}`}
      />
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
