"use client";

import { useState } from "react";

const sliderClass =
  "h-2.5 w-full cursor-pointer appearance-none rounded-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--home-border)] [&::-moz-range-thumb]:bg-[var(--home-accent)] [&::-moz-range-thumb]:shadow-none [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-none [&::-webkit-slider-thumb]:-mt-[3px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--home-border)] [&::-webkit-slider-thumb]:bg-[var(--home-accent)] [&::-webkit-slider-thumb]:shadow-none";

export const CalculatorSection = () => {
  const [athleteCount, setAthleteCount] = useState(5);
  const [monthlyFee, setMonthlyFee] = useState(999);

  const monthlyRevenue = athleteCount * monthlyFee;
  const overageAthletes = Math.max(0, athleteCount - 10);
  const platformCost = 399 + overageAthletes * 39;
  const netRevenue = monthlyRevenue - platformCost;
  const athleteSliderPct = ((athleteCount - 1) / 19) * 100;
  const feeSliderPct = (monthlyFee / 5000) * 100;

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">

        <div className="mb-12 border-b-2 border-[var(--home-border)] pb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--home-muted)]">
            Revenue Calculator
          </p>
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--home-text)] md:text-4xl">
            Calculate your earnings
          </h2>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">

          {/* Sliders */}
          <div className="space-y-4">
            <div className="border-2 border-[var(--home-border)] bg-[var(--home-surface)]">
              <div className="flex items-baseline justify-between border-b-2 border-[var(--home-border)] px-5 py-3">
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
                  max="20"
                  value={athleteCount}
                  onChange={(e) => setAthleteCount(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--home-accent) 0%, var(--home-accent) ${athleteSliderPct}%, var(--home-surface-strong) ${athleteSliderPct}%, var(--home-surface-strong) 100%)`,
                  }}
                  className={sliderClass}
                />
                <div className="mt-2 flex justify-between text-[10px] text-[var(--home-muted)]">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-[var(--home-border)] bg-[var(--home-surface)]">
              <div className="flex items-baseline justify-between border-b-2 border-[var(--home-border)] px-5 py-3">
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
              399 kr/mo base plan includes 10 athletes. Each additional athlete is 39 kr/mo.
            </p>
          </div>

          {/* Breakdown */}
          <div className="border-2 border-[var(--home-border)]">
            <div className="border-b-2 border-[var(--home-border)] bg-[var(--home-surface)] px-6 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--home-muted)]">
                Monthly breakdown
              </span>
            </div>

            <div className="divide-y-2 divide-[var(--home-border)] bg-[var(--home-surface)]">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="text-sm text-[var(--home-text)]">Revenue</div>
                  <div className="text-xs text-[var(--home-muted)]">
                    {athleteCount} × {monthlyFee.toLocaleString("sv-SE")} kr
                  </div>
                </div>
                <span className="font-[var(--font-display)] text-2xl text-[var(--home-text)]">
                  {monthlyRevenue.toLocaleString("sv-SE")} kr
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="text-sm text-[var(--home-text)]">Platform cost</div>
                  <div className="text-xs text-[var(--home-muted)]">
                    {overageAthletes > 0
                      ? `399 kr + ${overageAthletes} extra × 39 kr`
                      : "399 kr base plan"}
                  </div>
                </div>
                <span className="font-[var(--font-display)] text-2xl text-[var(--home-muted)]">
                  −{platformCost.toLocaleString("sv-SE")} kr
                </span>
              </div>
            </div>

            <div className="bg-[var(--home-accent)] px-6 py-6">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--home-surface)]/80">
                You keep
              </div>
              <div className="font-[var(--font-display)] text-5xl text-[var(--home-surface)]">
                {netRevenue.toLocaleString("sv-SE")} kr
              </div>
              <div className="mt-2 text-xs text-[var(--home-surface)]/70">
                per month — excl. taxes &amp; payment fees
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
