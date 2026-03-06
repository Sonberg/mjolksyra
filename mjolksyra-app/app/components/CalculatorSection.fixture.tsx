import { CalculatorSection } from "./CalculatorSection";
import type { Plan } from "@/services/plans/type";

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPriceSek: 199,
    includedAthletes: 5,
    extraAthletePriceSek: 49,
    sortOrder: 1,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPriceSek: 399,
    includedAthletes: 10,
    extraAthletePriceSek: 39,
    sortOrder: 2,
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPriceSek: 699,
    includedAthletes: 20,
    extraAthletePriceSek: 29,
    sortOrder: 3,
  },
];

export default {
  NormalApiPlans: () => <CalculatorSection plansOverride={plans} />,
  PreselectedNonCheapestPlan: () => (
    <CalculatorSection plansOverride={plans} initialSelectedPlanId="scale" />
  ),
  ApiErrorFallback: () => <CalculatorSection forceFallbackPricing />,
  HighAthleteOverage: () => (
    <CalculatorSection
      plansOverride={plans}
      initialAthleteCount={20}
      initialMonthlyFee={1200}
    />
  ),
};
