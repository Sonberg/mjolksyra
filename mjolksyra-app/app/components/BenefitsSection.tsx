import type { Plan } from "@/services/plans/type";
import { sortPlans } from "./calculatorUtils";

type BenefitsSectionProps = {
  plans: Plan[];
};

export const BenefitsSection = ({ plans }: BenefitsSectionProps) => {
  const sortedPlans = sortPlans(plans);
  const featuredPlanId =
    sortedPlans.length >= 2 ? sortedPlans[1].id : sortedPlans[0]?.id;

  return (
    <section className="relative overflow-hidden bg-[#151515] py-20 lg:py-32 dark:bg-[#0b0b0b]">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/40 pb-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              Pricing
            </p>
            <h2 className="font-[var(--font-display)] text-3xl text-white md:text-5xl">
              Pricing table
            </h2>
          </div>
          <div className="border border-white/50 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white">
            Cancel anytime
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:hidden">
          {sortedPlans.map((plan) => {
            const isFeatured = plan.id === featuredPlanId;
            return (
              <article
                key={plan.id}
                className={
                  isFeatured
                    ? "border border-white bg-black px-4 py-4 text-white shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]"
                    : "border border-white/50 bg-white/5 px-4 py-4 text-white"
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-[var(--font-display)] text-2xl">{plan.name}</h3>
                  {isFeatured ? (
                    <span className="border border-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]">
                      Popular
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-2xl font-black">
                  {plan.monthlyPriceSek.toLocaleString("sv-SE")} kr
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.1em] opacity-80">
                  {plan.includedAthletes} athletes included
                </p>
                <p className="mt-1 text-sm font-semibold">
                  +{plan.extraAthletePriceSek.toLocaleString("sv-SE")} kr / extra
                </p>
              </article>
            );
          })}
        </div>

        <div className="hidden overflow-hidden border border-white/50 bg-white/5 md:block">
          <div className="grid grid-cols-4 border-b border-white/40 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
            <span>Plan</span>
            <span>Monthly</span>
            <span>Included athletes</span>
            <span>Extra athlete</span>
          </div>
          {sortedPlans.length > 0 ? (
            sortedPlans.map((plan) => {
              const isFeatured = plan.id === featuredPlanId;
              return (
                <div
                  key={plan.id}
                  className={
                    isFeatured
                      ? "group relative grid grid-cols-4 border-b border-white/35 bg-black px-5 py-5 text-white transition last:border-b-0"
                      : "group relative grid grid-cols-4 border-b border-white/35 px-5 py-5 text-white transition hover:bg-white/10 last:border-b-0"
                  }
                >
                  {isFeatured ? (
                    <span className="absolute -right-2 -top-2 border border-white bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black">
                      Most popular
                    </span>
                  ) : null}
                  <span className="font-[var(--font-display)] text-3xl">{plan.name}</span>
                  <span className="text-2xl font-black">
                    {plan.monthlyPriceSek.toLocaleString("sv-SE")} kr
                  </span>
                  <span className="text-2xl font-black">{plan.includedAthletes}</span>
                  <span className="text-2xl font-black">
                    {plan.extraAthletePriceSek.toLocaleString("sv-SE")} kr
                  </span>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-sm text-white/80">
              No plans available right now.
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/80">
          <span className="h-2.5 w-2.5 border border-white bg-black" />
          Stripe fees and taxes are excluded
        </div>
      </div>
    </section>
  );
};
