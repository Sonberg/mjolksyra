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
    <section className="bg-[var(--home-surface)]/70 py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="font-[var(--font-display)] mb-12 text-3xl font-semibold text-[var(--home-text)] md:text-4xl">
          Coach with a clear pricing model
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-6 transition-colors hover:bg-[var(--home-surface-strong)]"
            >
              {benefit.icon && (
                <div className="mb-4 inline-flex rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] p-2.5">
                  <benefit.icon className="h-5 w-5 text-[var(--home-text)]" />
                </div>
              )}
              <h3 className="mb-2 text-xl font-semibold text-[var(--home-text)]">
                {benefit.title}
              </h3>
              <p className="text-[var(--home-muted)]">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 
