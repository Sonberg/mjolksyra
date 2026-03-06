"use client";

import type { Plan } from "@/services/plans/type";

type Props = {
  currentPlan: Plan;
  plans: Plan[];
  athleteCount: number;
};

function totalCost(plan: Plan, athleteCount: number) {
  return (
    plan.monthlyPriceSek +
    Math.max(0, athleteCount - plan.includedAthletes) * plan.extraAthletePriceSek
  );
}

export function CoachPlanNudge({ currentPlan, plans, athleteCount }: Props) {
  const currentCost = totalCost(currentPlan, athleteCount);

  // Only consider higher-tier plans (higher base price = upgrade)
  const betterUpgrade = plans
    .filter((p) => p.monthlyPriceSek > currentPlan.monthlyPriceSek)
    .map((p) => ({ plan: p, cost: totalCost(p, athleteCount) }))
    .filter(({ cost }) => cost < currentCost)
    .sort((a, b) => a.cost - b.cost)[0];

  if (!betterUpgrade) return null;

  const savings = currentCost - betterUpgrade.cost;

  return (
    <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3 text-sm text-[var(--shell-ink)]">
      <span className="font-semibold">Tip:</span> Upgrading to the{" "}
      <span className="font-semibold">{betterUpgrade.plan.name}</span> plan would save you{" "}
      <span className="font-semibold">{savings} kr/mo</span> with your current{" "}
      {athleteCount} athlete{athleteCount === 1 ? "" : "s"}.
    </div>
  );
}
