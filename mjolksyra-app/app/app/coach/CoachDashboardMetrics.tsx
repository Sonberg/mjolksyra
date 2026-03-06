"use client";

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
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Monthly recurring
        </p>
        <p className="mt-3 text-2xl font-semibold text-[var(--shell-ink)]">
          {recurringAthleteBilling.toLocaleString("sv-SE")} kr
        </p>
        <p className="mt-1 text-sm text-[var(--shell-muted)]">Athlete charges / month</p>
      </div>
      <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Coach plan
        </p>
        <p className="mt-3 text-2xl font-semibold text-[var(--shell-ink)]">
          {coachPlanMonthlySek.toLocaleString("sv-SE")} kr
        </p>
        <p className="mt-1 text-sm text-[var(--shell-muted)]">Your monthly platform subscription</p>
      </div>
      <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Net after plan
        </p>
        <p className="mt-3 text-2xl font-semibold text-[var(--shell-ink)]">
          {netAfterCoachPlan.toLocaleString("sv-SE")} kr
        </p>
        <p className="mt-1 text-sm text-[var(--shell-muted)]">Athlete billing minus {coachPlanMonthlySek} kr plan</p>
      </div>
      <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Free athlete spots
        </p>
        <p className="mt-3 text-2xl font-semibold text-[var(--shell-ink)]">
          {freeAthleteSpotsLeft}/{includedAthletes}
        </p>
        <p className="mt-1 text-sm text-[var(--shell-muted)]">Included plan spots remaining</p>
      </div>
    </section>
  );
}
