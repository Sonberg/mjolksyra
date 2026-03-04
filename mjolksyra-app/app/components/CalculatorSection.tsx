"use client";

import { useState } from "react";

export const CalculatorSection = () => {
  const [athleteCount, setAthleteCount] = useState(5);
  const [monthlyFee, setMonthlyFee] = useState(99);

  const monthlyRevenue = athleteCount * monthlyFee;
  const includedAthletes = 10;
  const overageAthletes = Math.max(0, athleteCount - includedAthletes);
  const platformCost = 39 + overageAthletes * 4;
  const netRevenue = monthlyRevenue - platformCost;
  const athleteSliderPct = ((athleteCount - 1) / (20 - 1)) * 100;
  const feeSliderPct = (monthlyFee / 500) * 100;

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-[var(--font-display)] mb-6 text-3xl font-semibold text-[var(--home-text)] md:text-4xl">
              Calculate your earnings
            </h2>
            <p className="mb-8 text-lg text-[var(--home-muted)]">
              Estimate your monthly coaching revenue and subtract the platform
              plan cost: $39/month includes 10 athletes, then $4 per extra
              athlete.
            </p>
            <div className="space-y-6">
              <div className="rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-5">
                <label className="mb-2 block text-sm text-[var(--home-muted)]">
                  Number of athletes
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={athleteCount}
                  onChange={(e) => setAthleteCount(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--home-accent) 0%, var(--home-accent) ${athleteSliderPct}%, var(--home-surface-strong) ${athleteSliderPct}%, var(--home-surface-strong) 100%)`,
                  }}
                  className="h-2.5 w-full cursor-pointer appearance-none rounded-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--home-border)] [&::-moz-range-thumb]:bg-[var(--home-accent)] [&::-moz-range-thumb]:shadow-none [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-none [&::-webkit-slider-thumb]:-mt-[3px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--home-border)] [&::-webkit-slider-thumb]:bg-[var(--home-accent)] [&::-webkit-slider-thumb]:shadow-none"
                />
                <div className="mt-3 font-semibold text-[var(--home-text)]">
                  {athleteCount} athletes
                </div>
              </div>
              <div className="rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-5">
                <label className="mb-2 block text-sm text-[var(--home-muted)]">
                  Monthly fee per athlete (USD)
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="5"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--home-accent) 0%, var(--home-accent) ${feeSliderPct}%, var(--home-surface-strong) ${feeSliderPct}%, var(--home-surface-strong) 100%)`,
                  }}
                  className="h-2.5 w-full cursor-pointer appearance-none rounded-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--home-border)] [&::-moz-range-thumb]:bg-[var(--home-accent)] [&::-moz-range-thumb]:shadow-none [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-none [&::-webkit-slider-thumb]:-mt-[3px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--home-border)] [&::-webkit-slider-thumb]:bg-[var(--home-accent)] [&::-webkit-slider-thumb]:shadow-none"
                />
                <div className="mt-3 font-semibold text-[var(--home-text)]">
                  ${monthlyFee} per month
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-8">
            <div className="space-y-6">
              <div>
                <div className="mb-2 text-[var(--home-muted)]">Monthly Revenue</div>
                <div className="text-3xl font-bold text-[var(--home-text)]">
                  ${monthlyRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="mb-2 text-[var(--home-muted)]">
                  Platform Cost ($39 + overage)
                </div>
                <div className="text-xl font-semibold text-[var(--home-muted)]">
                  -${platformCost.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-[var(--home-muted)]">
                  {overageAthletes} extra athlete{overageAthletes === 1 ? "" : "s"} x $4
                </div>
              </div>
              <div className="border-t-2 border-[var(--home-border)]/30 pt-6">
                <div className="mb-2 text-[var(--home-muted)]">
                  Estimated Revenue After Platform Cost
                </div>
                <div className="font-[var(--font-display)] text-4xl font-semibold text-[var(--home-text)]">
                  ${netRevenue.toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-[var(--home-muted)]">
                  Excludes taxes and payment processing fees.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
