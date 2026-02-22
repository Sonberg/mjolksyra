"use client";

import { DollarSignIcon, CheckCircle2Icon, ArrowRightIcon } from "lucide-react";

type Point = {
  title: string;
  text?: string;
  icon?: React.ElementType;
};

const benefits: Point[] = [
  {
    title: "Weekly Payments",
    text: "Secure payments powered by Stripe, directly to your account.",
    icon: DollarSignIcon,
  },
  {
    title: "No upfront costs",
    text: "We only take 10% per transaction—no hidden fees.",
    icon: CheckCircle2Icon,
  },
  {
    title: "Build your business",
    text: "Perfect for personal trainers, powerlifters, and fitness enthusiasts.",
    icon: ArrowRightIcon,
  },
];

export const BenefitsSection = () => {
  return (
    <section className="bg-zinc-950/30 py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="mb-12 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
          Start earning today
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-sm transition-colors hover:border-emerald-200/25"
            >
              {benefit.icon && (
                <div className="mb-4 inline-flex rounded-lg border border-emerald-200/20 bg-emerald-300/10 p-2.5">
                  <benefit.icon className="h-5 w-5 text-emerald-100" />
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
