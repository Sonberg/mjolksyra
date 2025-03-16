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
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
          Everything you need to succeed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm hover:border-white/20 transition-colors"
            >
              {feature.icon && (
                <feature.icon className="w-8 h-8 text-stone-200 mb-4" />
              )}
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 