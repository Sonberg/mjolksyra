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
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
              Calculate your earnings
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              See how much you could earn as a coach. Adjust the number of
              athletes and monthly fee to calculate your potential earnings.
            </p>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 mb-2">
                  Number of athletes
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={athleteCount}
                  onChange={(e) => setAthleteCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-white font-semibold mt-2">
                  {athleteCount} athletes
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">
                  Monthly fee per athlete
                </label>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="30"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-white font-semibold mt-2">
                  {monthlyFee} kr per month
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm rounded-xl p-8">
            <div className="space-y-6">
              <div>
                <div className="text-gray-400 mb-2">Monthly Revenue</div>
                <div className="text-3xl font-bold text-white">
                  {monthlyEarnings} kr
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-2">Platform Fee (10%)</div>
                <div className="text-xl font-semibold text-gray-300">
                  -{platformFee} kr
                </div>
              </div>
              <div className="pt-6 border-t border-gray-800">
                <div className="text-gray-400 mb-2">Your Monthly Earnings</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
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
