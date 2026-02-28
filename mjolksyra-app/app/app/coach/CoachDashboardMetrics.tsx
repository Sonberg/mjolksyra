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
  billedTraineesCount: number;
  traineesCount: number;
};

export function CoachDashboardMetrics({
  recurringAthleteBilling,
  coachPlanMonthlySek,
  netAfterCoachPlan,
  billedTraineesCount,
  traineesCount,
}: Props) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Monthly recurring
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {recurringAthleteBilling.toLocaleString("sv-SE")} kr
        </p>
        <p className="mt-1 text-sm text-zinc-400">Athlete charges / month</p>
      </div>
      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Coach plan
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {coachPlanMonthlySek.toLocaleString("sv-SE")} kr
        </p>
        <p className="mt-1 text-sm text-zinc-400">Your monthly platform subscription</p>
      </div>
      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Net after plan
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {netAfterCoachPlan.toLocaleString("sv-SE")} kr
        </p>
        <p className="mt-1 text-sm text-zinc-400">Athlete billing minus 399 kr plan</p>
      </div>
      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Priced athletes
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {billedTraineesCount}/{traineesCount}
        </p>
        <p className="mt-1 text-sm text-zinc-400">Billing starts after setting a price</p>
      </div>
    </section>
  );
}
