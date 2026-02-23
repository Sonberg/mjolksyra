"use client";

import { DumbbellIcon, CheckCircle2Icon, UsersIcon } from "lucide-react";

type Point = {
  title: string;
  text?: string;
  icon?: React.ElementType;
};

const features: Point[] = [
  {
    title: "For lifters, by lifters",
    text: "Built by passionate athletes who understand your needs.",
    icon: DumbbellIcon,
  },
  {
    title: "Extensive exercise library",
    text: "Access over 800 exercises with detailed instructions.",
    icon: CheckCircle2Icon,
  },
  {
    title: "Drag-and-drop workouts",
    text: "Easily design your workouts with our intuitive interface.",
    icon: DumbbellIcon,
  },
  {
    title: "Unlimited athletes",
    text: "Coach as many athletes as you want, with no restrictions.",
    icon: UsersIcon,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="font-[var(--font-display)] mb-12 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
          Everything you need to succeed
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 transition-colors hover:border-zinc-500"
            >
              {feature.icon && (
                <div className="mb-4 inline-flex rounded-lg border border-zinc-700 bg-zinc-900 p-2.5">
                  <feature.icon className="h-5 w-5 text-zinc-200" />
                </div>
              )}
              <h3 className="mb-2 text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-zinc-400">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 
