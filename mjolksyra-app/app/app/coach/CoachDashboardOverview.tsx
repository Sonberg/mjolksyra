import { Trainee } from "@/services/trainees/type";

type Props = {
  trainees: Trainee[];
};

export function CoachDashboardOverview({ trainees }: Props) {
  const includedAthletes = 10;
  const overageAthletes = Math.max(0, trainees.length - includedAthletes);
  const billedTrainees = trainees.filter((x) => x.cost);
  const revenue = billedTrainees.reduce(
    (acc, trainee) => {
      if (!trainee.cost) return acc;

      acc.gross += trainee.cost.total;
      acc.coach += trainee.cost.coach;
      acc.fee += trainee.cost.applicationFee;
      return acc;
    },
    { gross: 0, coach: 0, fee: 0 },
  );

  return (
    <div className="space-y-8">
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
            {billedTrainees.length}/{trainees.length}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Billing starts after setting a price
          </p>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Platform plan
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
          Coach subscription
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          $39/mo includes {includedAthletes} athletes. Current overage: $
          {overageAthletes * 4}/mo ({overageAthletes} x $4).
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Athlete roster management lives in the Athletes tab.
        </p>
      </section>
    </div>
  );
}
