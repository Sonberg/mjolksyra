import type { Plan } from "@/services/plans/type";

export const FALLBACK_CALCULATOR_PLAN: Plan = {
  id: "fallback-standard-plan",
  name: "Standard",
  monthlyPriceSek: 399,
  includedAthletes: 10,
  extraAthletePriceSek: 39,
  sortOrder: 999,
  includedAiCreditsPerCycle: 25,
};

export function sortPlans(plans: Plan[]): Plan[] {
  return [...plans].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return a.monthlyPriceSek - b.monthlyPriceSek;
  });
}

export function computePlanCost(plan: Plan, athleteCount: number): number {
  return (
    plan.monthlyPriceSek +
    Math.max(0, athleteCount - plan.includedAthletes) * plan.extraAthletePriceSek
  );
}

export function pickCheapestPlan(
  plans: Plan[],
  athleteCount: number,
): Plan | null {
  if (plans.length === 0) {
    return null;
  }

  const sorted = sortPlans(plans);
  let cheapest = sorted[0];
  let cheapestCost = computePlanCost(cheapest, athleteCount);

  for (let i = 1; i < sorted.length; i++) {
    const plan = sorted[i];
    const cost = computePlanCost(plan, athleteCount);

    if (cost < cheapestCost) {
      cheapest = plan;
      cheapestCost = cost;
    }
  }

  return cheapest;
}
