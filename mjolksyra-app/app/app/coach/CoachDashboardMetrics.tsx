"use client";

type Revenue = {
  gross: number;
  coach: number;
  fee: number;
};

type Props = {
  revenue: Revenue;
  billedTraineesCount: number;
  traineesCount: number;
};

export function CoachDashboardMetrics({
  revenue,
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
          {revenue.gross.toLocaleString("sv-SE")} kr
        </p>
        <p className="mt-1 text-sm text-zinc-400">Projected athlete billing</p>
      </div>
      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Coach payout
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {revenue.coach.toLocaleString("sv-SE")} kr
        </p>
        <p className="mt-1 text-sm text-zinc-400">Before Stripe transfer timing</p>
      </div>
      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Platform fee
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {revenue.fee.toLocaleString("sv-SE")} kr
        </p>
        <p className="mt-1 text-sm text-zinc-400">Current trainee-based model</p>
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
