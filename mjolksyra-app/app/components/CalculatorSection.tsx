"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlans } from "@/services/plans/getPlans";
import type { Plan } from "@/services/plans/type";
import { SelectionTabs } from "@/components/Navigation/SelectionTabs";
import {
  FALLBACK_CALCULATOR_PLAN,
  computePlanCost,
  pickCheapestPlan,
  sortPlans,
} from "./calculatorUtils";

const sliderClass =
  "h-2.5 w-full cursor-pointer appearance-none rounded-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[var(--home-border)] [&::-moz-range-thumb]:bg-[var(--home-accent)] [&::-moz-range-thumb]:shadow-none [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-none [&::-webkit-slider-thumb]:-mt-[3px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--home-border)] [&::-webkit-slider-thumb]:bg-[var(--home-accent)] [&::-webkit-slider-thumb]:shadow-none";

type CalculatorSectionProps = {
  plansOverride?: Plan[];
  forceFallbackPricing?: boolean;
  initialAthleteCount?: number;
  initialMonthlyFee?: number;
  initialSelectedPlanId?: string;
};

export const CalculatorSection = ({
  plansOverride,
  forceFallbackPricing = false,
  initialAthleteCount = 5,
  initialMonthlyFee = 999,
  initialSelectedPlanId,
}: CalculatorSectionProps = {}) => {
  const [athleteCount, setAthleteCount] = useState(initialAthleteCount);
  const [monthlyFee, setMonthlyFee] = useState(initialMonthlyFee);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialSelectedPlanId ?? null,
  );
  const [hasManualPlanSelection, setHasManualPlanSelection] = useState(
    Boolean(initialSelectedPlanId),
  );

  const { data: apiPlans = [], isError } = useQuery({
    queryKey: ["homepage-calculator", "plans"],
    queryFn: getPlans,
    enabled: !plansOverride && !forceFallbackPricing,
    retry: false,
  });

  const isUsingFallbackPricing = forceFallbackPricing || (
    !plansOverride && (isError || apiPlans.length === 0)
  );

  const plans = useMemo(() => {
    if (forceFallbackPricing) {
      return [FALLBACK_CALCULATOR_PLAN];
    }

    if (plansOverride && plansOverride.length > 0) {
      return sortPlans(plansOverride);
    }

    if (apiPlans.length > 0) {
      return sortPlans(apiPlans);
    }

    return [FALLBACK_CALCULATOR_PLAN];
  }, [apiPlans, forceFallbackPricing, plansOverride]);

  const cheapestPlan = pickCheapestPlan(plans, athleteCount) ?? FALLBACK_CALCULATOR_PLAN;
  const manuallySelectedPlan = selectedPlanId
    ? plans.find((x) => x.id === selectedPlanId)
    : undefined;
  const selectedPlan =
    hasManualPlanSelection && manuallySelectedPlan
      ? manuallySelectedPlan
      : cheapestPlan;

  const monthlyRevenue = athleteCount * monthlyFee;
  const platformCost = computePlanCost(selectedPlan, athleteCount);
  const netRevenue = monthlyRevenue - platformCost;
  const overageAthletes = Math.max(0, athleteCount - selectedPlan.includedAthletes);
  const athleteSliderPct = ((athleteCount - 1) / 29) * 100;
  const feeSliderPct = (monthlyFee / 5000) * 100;

  const planItems = plans.map((plan) => ({
    key: plan.id,
    label: plan.name,
    onSelect: () => {
      setSelectedPlanId(plan.id);
      setHasManualPlanSelection(true);
    },
  }));

  return (
    <section className="py-20 lg:py-32" data-testid="calculator-section">
      <div className="mx-auto max-w-screen-xl px-4">

        <div className="mb-12 border-b border-[var(--home-border)] pb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--home-muted)]">
            Revenue Calculator
          </p>
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--home-text)] md:text-4xl">
            Calculate your earnings
          </h2>
        </div>

        <div className="mb-6 border border-[var(--home-border)] bg-[var(--home-surface)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--home-border)] pb-2">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--home-muted)]">
              Plan
            </span>
            <span className="text-xs text-[var(--home-muted)]">
              {selectedPlan.monthlyPriceSek} kr/mo · includes {selectedPlan.includedAthletes}
            </span>
          </div>
          <SelectionTabs
            items={planItems}
            activeKey={selectedPlan.id}
            size="sm"
            className="w-full"
            itemClassName="px-3 text-[var(--home-muted)]"
            activeItemClassName="!bg-[var(--home-accent)] !text-[var(--home-accent-ink)] font-bold"
            fullWidth
          />
          {isUsingFallbackPricing ? (
            <p className="mt-3 text-xs text-[var(--home-muted)]" data-testid="calculator-fallback-pricing">
              Using fallback pricing data.
            </p>
          ) : null}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">

          {/* Sliders */}
          <div className="space-y-4">
            <div className="border border-[var(--home-border)] bg-[var(--home-surface)]">
              <div className="flex items-baseline justify-between border-b border-[var(--home-border)] px-5 py-3">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--home-muted)]">
                  Athletes
                </span>
                <span className="font-[var(--font-display)] text-2xl text-[var(--home-text)]">
                  {athleteCount}
                </span>
              </div>
              <div className="px-5 py-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={athleteCount}
                  onChange={(e) => setAthleteCount(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--home-accent) 0%, var(--home-accent) ${athleteSliderPct}%, var(--home-surface-strong) ${athleteSliderPct}%, var(--home-surface-strong) 100%)`,
                  }}
                  className={sliderClass}
                />
                <div className="mt-2 flex justify-between text-[10px] text-[var(--home-muted)]">
                  <span>1</span>
                  <span>30</span>
                </div>
              </div>
            </div>

            <div className="border border-[var(--home-border)] bg-[var(--home-surface)]">
              <div className="flex items-baseline justify-between border-b border-[var(--home-border)] px-5 py-3">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--home-muted)]">
                  Monthly fee per athlete
                </span>
                <span className="font-[var(--font-display)] text-2xl text-[var(--home-text)]">
                  {monthlyFee.toLocaleString("sv-SE")} kr
                </span>
              </div>
              <div className="px-5 py-4">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--home-accent) 0%, var(--home-accent) ${feeSliderPct}%, var(--home-surface-strong) ${feeSliderPct}%, var(--home-surface-strong) 100%)`,
                  }}
                  className={sliderClass}
                />
                <div className="mt-2 flex justify-between text-[10px] text-[var(--home-muted)]">
                  <span>0 kr</span>
                  <span>5 000 kr</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--home-muted)]">
              {selectedPlan.monthlyPriceSek} kr/mo includes {selectedPlan.includedAthletes} athletes.
              {" "}Each additional athlete is {selectedPlan.extraAthletePriceSek} kr/mo.
            </p>
          </div>

          {/* Breakdown */}
          <div className="border border-[var(--home-border)]">
            <div className="border-b border-[var(--home-border)] bg-[var(--home-surface)] px-6 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--home-muted)]">
                Monthly breakdown
              </span>
            </div>

            <div className="divide-y divide-[var(--home-border)] bg-[var(--home-surface)]">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="text-sm text-[var(--home-text)]">Revenue</div>
                  <div className="text-xs text-[var(--home-muted)]">
                    {athleteCount} × {monthlyFee.toLocaleString("sv-SE")} kr
                  </div>
                </div>
                <span
                  className="font-[var(--font-display)] text-2xl text-[var(--home-text)]"
                  data-testid="calculator-revenue"
                >
                  {monthlyRevenue.toLocaleString("sv-SE")} kr
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="text-sm text-[var(--home-text)]">Platform cost</div>
                  <div className="text-xs text-[var(--home-muted)]">
                    {overageAthletes > 0
                      ? `${selectedPlan.monthlyPriceSek} kr + ${overageAthletes} extra × ${selectedPlan.extraAthletePriceSek} kr`
                      : `${selectedPlan.monthlyPriceSek} kr ${selectedPlan.name} plan`}
                  </div>
                </div>
                <span
                  className="font-[var(--font-display)] text-2xl text-[var(--home-muted)]"
                  data-testid="calculator-platform-cost"
                >
                  −{platformCost.toLocaleString("sv-SE")} kr
                </span>
              </div>
            </div>

            <div className="bg-[var(--home-accent)] px-6 py-6">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--home-accent-ink)] opacity-80">
                You keep
              </div>
              <div
                className="font-[var(--font-display)] text-5xl text-[var(--home-accent-ink)]"
                data-testid="calculator-net-revenue"
              >
                {netRevenue.toLocaleString("sv-SE")} kr
              </div>
              <div className="mt-2 text-xs text-[var(--home-accent-ink)] opacity-70">
                per month — excl. taxes &amp; payment fees
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
