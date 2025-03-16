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
    <section className="py-20 lg:py-32 bg-gray-950/30">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
          Start earning today
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="p-6 rounded-xl bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm hover:border-white/20 transition-colors"
            >
              {benefit.icon && (
                <benefit.icon className="w-8 h-8 text-stone-200 mb-4" />
              )}
              <h3 className="text-xl font-semibold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-400">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 