"use client";

import { ApiClient } from "@/services/client";
import { Spinner } from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import { WorkoutPlannerDemo } from "@/components/WorkoutPlannerDemo/WorkoutPlannerDemo";
import { isBeta } from "@/constants/isBeta";
import { RegisterDialog } from "@/dialogs/RegisterDialog";
import { useValidation } from "@/hooks/useValidation";
import { useState } from "react";
import { z } from "zod";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  DollarSignIcon,
  DumbbellIcon,
  UsersIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";

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

const faqs = [
  {
    question: "How do payments work?",
    answer: "We handle all payments through Stripe, ensuring secure transactions. You'll receive weekly payouts directly to your bank account, with just a 10% platform fee deducted.",
  },
  {
    question: "Do I need to be a certified trainer?",
    answer: "While certification is not required to use our platform, we encourage all coaches to operate within their expertise and follow local regulations regarding fitness coaching.",
  },
  {
    question: "How many athletes can I coach?",
    answer: "There's no limit! You can coach as many athletes as you can effectively manage. Our platform scales with your business.",
  },
  {
    question: "Can I customize workout plans?",
    answer: "Absolutely! Our drag-and-drop interface allows you to create fully customized workout plans. You can also save templates and reuse them for different athletes.",
  },
  {
    question: "What's the onboarding process like?",
    answer: "Getting started is simple: create an account, set up your Stripe connection for payments, and start inviting athletes. We'll guide you through each step.",
  },
];

export default function Home() {
  const [athleteCount, setAthleteCount] = useState(5);
  const [monthlyFee, setMonthlyFee] = useState(100);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const monthlyEarnings = athleteCount * monthlyFee;
  const platformFee = monthlyEarnings * 0.1; // 10% platform fee
  const netEarnings = monthlyEarnings - platformFee;

  return (
    <div className="overflow-y-auto bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm"></div>
        <div className="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-44 relative">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="max-w-2xl mb-8 text-4xl leading-relaxed font-extrabold tracking-tight md:text-5xl xl:text-6xl">
              <span className="bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
                Transform Your Coaching <br />
                Into a Business
              </span>
            </h1>
            <p className="max-w-2xl mb-6 text-gray-400 lg:mb-8 md:text-lg lg:text-xl">
              Start your coaching journey today. Create and sell workout
              programs with our intuitive platform. Perfect for Personal
              Trainers, Powerlifters, Crossfitters, and Weightlifters.
            </p>
            <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
              {isBeta ? (
                <SignupForm />
              ) : (
                <RegisterDialog
                  trigger={
                    <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                      Get Started Now
                    </button>
                  }
                />
              )}
            </div>
          </div>
          <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <img
              src="/images/landing-page/healthy-habit.svg"
              alt="hero image"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Benefits Section */}
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

      {/* Calculator Section */}
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
                    min="50"
                    max="500"
                    step="10"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-white font-semibold mt-2">
                    ${monthlyFee} per month
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm rounded-xl p-8">
              <div className="space-y-6">
                <div>
                  <div className="text-gray-400 mb-2">Monthly Revenue</div>
                  <div className="text-3xl font-bold text-white">
                    ${monthlyEarnings}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">Platform Fee (10%)</div>
                  <div className="text-xl font-semibold text-gray-300">
                    -${platformFee}
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-800">
                  <div className="text-gray-400 mb-2">
                    Your Monthly Earnings
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
                    ${netEarnings}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
              Try our workout planner
            </h2>
            <p className="text-gray-400 text-lg">
              Experience our intuitive drag-and-drop interface
            </p>
          </div>
          <div className="rounded-xl border border-gray-800/50 bg-gray-950/50 backdrop-blur-sm overflow-hidden">
            <WorkoutPlannerDemo />
          </div>
        </div>
      </section>

      {/* Stripe Integration Section */}
      <section className="py-20 lg:py-32 bg-gray-950/30">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
            Powered by Stripe
          </h2>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm rounded-xl p-8 w-full max-w-md">
              <img
                src="/images/stripe-white.svg"
                alt="Stripe logo"
                className="h-12 w-auto mx-auto mb-6"
              />
              <p className="text-gray-400 text-lg">
                Secure payments and automated weekly payouts directly to your bank account
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="rounded-xl bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <MinusIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <PlusIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gray-950/30">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
            Ready to start your coaching journey?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join our community of successful coaches and start building your
            fitness business today.
          </p>
          <RegisterDialog
            trigger={
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                Get Started Now
              </button>
            }
          />
        </div>
      </section>
    </div>
  );
}

const schema = z.object({
  email: z.string().email(),
});

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setSubmitted] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const validation = useValidation({
    schema,
    values: { email },
  });

  async function onSubmit() {
    if (!validation.success) return;
    setLoading(true);
    await ApiClient.post("/api/signup", validation.parsed);
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="w-full flex flex-col items-start gap-4">
      <div className="text-sm text-gray-400">Want to stay in touch?</div>
      <Input
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        placeholder="Your email"
        className="bg-white/10 border-gray-800/50 text-white placeholder:text-gray-500"
      />
      <button
        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors disabled:opacity-50"
        disabled={isSubmitted}
        onClick={onSubmit}
      >
        {isLoading ? <Spinner size={8} /> : null}
        {isSubmitted ? "Thank you!" : "Sign me up"}
      </button>
    </div>
  );
};
