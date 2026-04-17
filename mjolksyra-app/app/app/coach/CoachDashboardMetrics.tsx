"use client";

import { Card, CardContent } from "@/components/ui/card";

type Revenue = {
  recurringAthleteBilling: number;
  coachPlanMonthlySek: number;
  netAfterCoachPlan: number;
};

type Props = {
  recurringAthleteBilling: Revenue["recurringAthleteBilling"];
  coachPlanMonthlySek: Revenue["coachPlanMonthlySek"];
  netAfterCoachPlan: Revenue["netAfterCoachPlan"];
  freeAthleteSpotsLeft: number;
  includedAthletes: number;
};

export function CoachDashboardMetrics({
  recurringAthleteBilling,
  coachPlanMonthlySek,
  netAfterCoachPlan,
  freeAthleteSpotsLeft,
  includedAthletes,
}: Props) {
  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Monthly recurring</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-[var(--shell-ink)]">{recurringAthleteBilling.toLocaleString("sv-SE")} kr</p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Athlete charges / month</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Coach plan</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--shell-ink)]">{coachPlanMonthlySek.toLocaleString("sv-SE")} kr</p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Monthly platform subscription</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Net after plan</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--shell-ink)]">{netAfterCoachPlan.toLocaleString("sv-SE")} kr</p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Billing minus {coachPlanMonthlySek} kr plan</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Free spots</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--shell-ink)]">{freeAthleteSpotsLeft}/{includedAthletes}</p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Included plan spots remaining</p>
        </CardContent>
      </Card>
    </section>
  );
}
