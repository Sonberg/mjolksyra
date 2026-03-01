"use client";

import { ApiClient } from "@/services/client";
import { Trainee } from "@/services/trainees/type";
import { User } from "@/services/users/type";
import { useCallback, useState } from "react";
import { AlertTriangleIcon, CheckCircle2Icon, MessageSquareIcon, WalletIcon } from "lucide-react";
import { CoachDashboardMetrics } from "./CoachDashboardMetrics";
import {
  CoachDashboardTodoSection,
  type CoachTodoItem,
} from "./CoachDashboardTodoSection";
import { CoachDashboardSubscriptionSection } from "./CoachDashboardSubscriptionSection";

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
  const [isOpeningStripe, setIsOpeningStripe] = useState(false);
  const includedAthletes = 10;
  const overagePriceSek = 39;
  const overageAthletes = Math.max(0, trainees.length - includedAthletes);
  const coachPlanMonthlySek = 399;
  const pricedAthletes = trainees.filter((x) => x.billing.hasPrice);
  const recurringAthleteBilling = trainees.reduce((acc, trainee) => {
    if (!trainee.cost) return acc;
    return acc + trainee.cost.total;
  }, 0);
  const netAfterCoachPlan = Math.max(0, recurringAthleteBilling - coachPlanMonthlySek);
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
  const paymentBlocked = trainees.filter(
    (x) =>
      x.billing.status === "AwaitingAthletePaymentMethod" ||
      x.billing.status === "AwaitingCoachStripeSetup"
  );
  const needsPrice = trainees.filter((x) => !x.billing.hasPrice);
  const programEndingSoon = trainees.filter((x) => {
    if (!x.nextWorkoutAt) return true;
    const daysUntilNext =
      (new Date(x.nextWorkoutAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilNext >= 0 && daysUntilNext <= 7;
  });
  const needsFeedback = trainees.filter((x) => {
    if (!x.lastWorkoutAt) return false;
    const hoursSince =
      (Date.now() - new Date(x.lastWorkoutAt).getTime()) / (1000 * 60 * 60);
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
      tone:
        paymentBlocked.length > 0
          ? "border-amber-800 bg-amber-950/40 text-amber-200"
          : "border-zinc-800 bg-zinc-900 text-zinc-300",
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
      tone:
        needsFeedback.length > 0
          ? "border-zinc-700 bg-zinc-900 text-zinc-100"
          : "border-zinc-800 bg-zinc-900 text-zinc-300",
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
      tone:
        needsPrice.length > 0
          ? "border-zinc-700 bg-zinc-900 text-zinc-100"
          : "border-zinc-800 bg-zinc-900 text-zinc-300",
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
      tone:
        programEndingSoon.length > 0
          ? "border-zinc-700 bg-zinc-900 text-zinc-100"
          : "border-zinc-800 bg-zinc-900 text-zinc-300",
    },
  ];
  const coachPaymentStatus =
    user.onboarding.coach === "Completed"
      ? {
          label: "Stripe connected",
          text: "Payouts and coach billing setup are active.",
          badgeClass: "border-emerald-800 bg-emerald-950 text-emerald-200",
        }
      : user.onboarding.coach === "Started"
        ? {
            label: "Setup in progress",
            text: "Complete your Stripe onboarding to enable coach billing and payouts.",
            badgeClass: "border-amber-800 bg-amber-950 text-amber-200",
          }
        : {
            label: "Not connected",
            text: "Connect Stripe to receive payouts and manage coach billing settings.",
            badgeClass: "border-zinc-700 bg-zinc-900 text-zinc-300",
          };

  return (
    <div className="space-y-8">
      <CoachDashboardMetrics
        recurringAthleteBilling={recurringAthleteBilling}
        coachPlanMonthlySek={coachPlanMonthlySek}
        netAfterCoachPlan={netAfterCoachPlan}
        billedTraineesCount={pricedAthletes.length}
        traineesCount={trainees.length}
      />
      <CoachDashboardTodoSection items={todoItems} />
      <CoachDashboardSubscriptionSection
        coachPaymentStatus={coachPaymentStatus}
        includedAthletes={includedAthletes}
        overagePriceSek={overagePriceSek}
        overageAthletes={overageAthletes}
        isOpeningStripe={isOpeningStripe}
        onOpenStripeDashboard={openStripeDashboard}
        trialEndsAt={user.onboarding.coachTrialEndsAt ?? null}
      />
    </div>
  );
}
