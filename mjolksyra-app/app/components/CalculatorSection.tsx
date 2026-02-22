"use client";

import { useState } from "react";

export const CalculatorSection = () => {
  const [athleteCount, setAthleteCount] = useState(5);
  const [monthlyFee, setMonthlyFee] = useState(1000);

  const monthlyEarnings = Math.max(
    athleteCount * 50,
    athleteCount * monthlyFee
  );

  const platformFee = Math.max(athleteCount * 50, monthlyEarnings * 0.1); // 10% platform fee
  const netEarnings = monthlyEarnings - platformFee;

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              Calculate your earnings
            </h2>
            <p className="mb-8 text-lg text-zinc-400">
              See how much you could earn as a coach. Adjust the number of
              athletes and monthly fee to calculate your potential earnings.
            </p>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-zinc-400">
                  Number of athletes
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={athleteCount}
                  onChange={(e) => setAthleteCount(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800"
                />
                <div className="mt-2 font-semibold text-white">
                  {athleteCount} athletes
                </div>
              </div>
              <div>
                <label className="mb-2 block text-zinc-400">
                  Monthly fee per athlete
                </label>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="30"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800"
                />
                <div className="mt-2 font-semibold text-white">
                  {monthlyFee} kr per month
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-8 backdrop-blur-sm">
            <div className="space-y-6">
              <div>
                <div className="mb-2 text-zinc-400">Monthly Revenue</div>
                <div className="text-3xl font-bold text-white">
                  {monthlyEarnings} kr
                </div>
              </div>
              <div>
                <div className="mb-2 text-zinc-400">Platform Fee (10%)</div>
                <div className="text-xl font-semibold text-zinc-300">
                  -{platformFee} kr
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="mb-2 text-zinc-400">Your Monthly Earnings</div>
                <div className="bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-4xl font-bold text-transparent">
                  {netEarnings} kr
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
