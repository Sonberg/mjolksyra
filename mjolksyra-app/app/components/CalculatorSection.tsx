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
            <h2 className="font-[var(--font-display)] mb-6 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
              Calculate your earnings
            </h2>
            <p className="mb-8 text-lg text-zinc-400">
              Estimate your monthly coaching revenue and subtract the platform
              plan cost: $39/month includes 10 athletes, then $4 per extra
              athlete.
            </p>
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5">
                <label className="mb-2 block text-sm text-zinc-400">
                  Number of athletes
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={athleteCount}
                  onChange={(e) => setAthleteCount(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, rgb(244 244 245) 0%, rgb(244 244 245) ${athleteSliderPct}%, rgb(39 39 42) ${athleteSliderPct}%, rgb(39 39 42) 100%)`,
                  }}
                  className="h-2.5 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zinc-950 [&::-moz-range-thumb]:bg-zinc-100 [&::-moz-range-thumb]:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:-mt-[3px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-950 [&::-webkit-slider-thumb]:bg-zinc-100 [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]"
                />
                <div className="mt-3 font-semibold text-white">
                  {athleteCount} athletes
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5">
                <label className="mb-2 block text-sm text-zinc-400">
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
                    background: `linear-gradient(to right, rgb(244 244 245) 0%, rgb(244 244 245) ${feeSliderPct}%, rgb(39 39 42) ${feeSliderPct}%, rgb(39 39 42) 100%)`,
                  }}
                  className="h-2.5 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zinc-950 [&::-moz-range-thumb]:bg-zinc-100 [&::-moz-range-thumb]:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:-mt-[3px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-950 [&::-webkit-slider-thumb]:bg-zinc-100 [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]"
                />
                <div className="mt-3 font-semibold text-white">
                  ${monthlyFee} per month
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-8">
            <div className="space-y-6">
              <div>
                <div className="mb-2 text-zinc-400">Monthly Revenue</div>
                <div className="text-3xl font-bold text-white">
                  ${monthlyRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="mb-2 text-zinc-400">
                  Platform Cost ($39 + overage)
                </div>
                <div className="text-xl font-semibold text-zinc-300">
                  -${platformCost.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {overageAthletes} extra athlete{overageAthletes === 1 ? "" : "s"} x $4
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="mb-2 text-zinc-400">
                  Estimated Revenue After Platform Cost
                </div>
                <div className="font-[var(--font-display)] bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-4xl font-semibold text-transparent">
                  ${netRevenue.toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-zinc-500">
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
