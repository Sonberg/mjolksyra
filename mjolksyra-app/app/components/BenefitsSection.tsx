"use client";

import { DollarSignIcon, CheckCircle2Icon, ArrowRightIcon } from "lucide-react";

type Point = {
  title: string;
  text?: string;
  icon?: React.ElementType;
};

const benefits: Point[] = [
  {
    title: "Coach plan pricing",
    text: "$39/month includes 10 athletes, then $4 per additional athlete.",
    icon: DollarSignIcon,
  },
  {
    title: "Stripe-powered payouts",
    text: "Manage payouts and account settings securely through Stripe.",
    icon: CheckCircle2Icon,
  },
  {
    title: "Build your business",
    text: "Organize athletes, plan training blocks, and deliver structured coaching.",
    icon: ArrowRightIcon,
  },
];

export const BenefitsSection = () => {
  return (
    <section className="bg-zinc-950/40 py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="font-[var(--font-display)] mb-12 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
          Coach with a clear pricing model
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 transition-colors hover:border-zinc-500"
            >
              {benefit.icon && (
                <div className="mb-4 inline-flex rounded-lg border border-zinc-700 bg-zinc-900 p-2.5">
                  <benefit.icon className="h-5 w-5 text-zinc-200" />
                </div>
              )}
              <h3 className="mb-2 text-xl font-semibold text-white">
                {benefit.title}
              </h3>
              <p className="text-zinc-400">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 
