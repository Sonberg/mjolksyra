"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import type { Plan } from "@/services/plans/type";
import { updateCoachPlan } from "@/services/coaches/updateCoachPlan";

type Props = {
  plans: Plan[];
  currentPlanId: string | null | undefined;
  athleteCount: number;
};

export function CoachPlanSelector({ plans, currentPlanId, athleteCount }: Props) {
  const router = useRouter();
  const [selectingPlanId, setSelectingPlanId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (planId: string) => updateCoachPlan(planId),
    onSuccess: () => {
      router.refresh();
      setSelectingPlanId(null);
    },
    onError: () => {
      setSelectingPlanId(null);
    },
  });

  function totalCost(plan: Plan) {
    return plan.monthlyPriceSek + Math.max(0, athleteCount - plan.includedAthletes) * plan.extraAthletePriceSek;
  }

  const cheapestCost = Math.min(...plans.map(totalCost));

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--shell-muted)]">Choose plan</p>
      <p className="mt-1 mb-3 text-xs text-[var(--shell-muted)]">
        Plan changes take effect on your next billing cycle.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((plan) => {
          const isActive = plan.id === currentPlanId;
          const isCheapest = totalCost(plan) === cheapestCost;
          const isPending = selectingPlanId === plan.id;
          const cost = totalCost(plan);
          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-none border p-4 flex flex-col gap-2",
                isActive
                  ? "border-[var(--shell-ink)] bg-[var(--shell-surface-strong)]"
                  : "border-[var(--shell-border)] bg-[var(--shell-surface)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-[var(--shell-ink)]">{plan.name}</p>
                {isCheapest && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] border border-[var(--shell-border)] px-1.5 py-0.5 text-[var(--shell-ink)] whitespace-nowrap">
                    Best value
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold text-[var(--shell-ink)]">
                {plan.monthlyPriceSek} kr
                <span className="text-sm font-normal text-[var(--shell-muted)]">/mo</span>
              </p>
              <ul className="text-xs text-[var(--shell-muted)] space-y-0.5">
                <li>{plan.includedAthletes} athletes included</li>
                <li>+{plan.extraAthletePriceSek} kr/extra athlete</li>
                <li className="font-medium text-[var(--shell-ink)]">
                  Total now: {cost} kr/mo
                </li>
              </ul>
              {isActive ? (
                <p className="mt-auto pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                  Current plan
                </p>
              ) : (
                <Button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => {
                    setSelectingPlanId(plan.id);
                    mutation.mutate(plan.id);
                  }}
                  className="mt-auto rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-3 py-1.5 text-xs font-semibold text-[var(--shell-surface)] hover:opacity-80 disabled:opacity-50"
                >
                  {isPending && mutation.isPending ? <Spinner size={12} /> : "Select"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
