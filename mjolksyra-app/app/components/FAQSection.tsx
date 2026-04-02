"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { Plan } from "@/services/plans/type";
import { FALLBACK_CALCULATOR_PLAN, sortPlans } from "./calculatorUtils";
import { cn } from "@/lib/utils";

type FAQSectionProps = {
  plans?: Plan[];
};

export const FAQSection = ({ plans = [] }: FAQSectionProps) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const plan = sortPlans(plans)[0] ?? FALLBACK_CALCULATOR_PLAN;

  const faqs = [
    {
      question: "How do payments work?",
      answer: `Coaches pay a platform subscription of ${plan.monthlyPriceSek.toLocaleString("en-US")} kr/month (SEK), which includes up to ${plan.includedAthletes} athletes. Additional active athletes cost ${plan.extraAthletePriceSek} kr per athlete per month. Athlete invitations and billing setup are handled through secure flows.`,
    },
    {
      question: "Do I need to be a certified trainer?",
      answer: "While certification is not required to use our platform, we encourage all coaches to operate within their expertise and follow local regulations regarding fitness coaching.",
    },
    {
      question: "How many athletes can I coach?",
      answer: `Your plan includes ${plan.includedAthletes} athletes. You can add more anytime for ${plan.extraAthletePriceSek} kr per additional active athlete per month.`,
    },
    {
      question: "What does Mjölksyra mean?",
      answer: "Mjölksyra is the Swedish word for lactic acid — the burn you feel in your muscles when you push hard. We chose it because it represents effort, discomfort, and growth. The things good coaching is built on.",
    },
    {
      question: "Can coaches from any country sign up?",
      answer: "Yes, coaches from all countries are welcome. The platform is in English and payments are processed through Stripe, which supports coaches and athletes worldwide. Pricing is in Swedish Kronor (SEK) and Stripe handles currency conversion automatically.",
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

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="mb-12 text-center text-3xl font-semibold text-[var(--home-text)] md:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-3xl border-t border-[var(--home-border)]">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="border-b border-[var(--home-border)]">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-base font-semibold text-[var(--home-text)]">
                  {faq.question}
                </span>
                <ChevronDownIcon
                  className={cn(
                    "h-5 w-5 shrink-0 text-[var(--home-muted)] transition-transform duration-200",
                    openFaqIndex === index && "rotate-180",
                  )}
                />
              </button>
              {openFaqIndex === index && (
                <div className="pb-5">
                  <p className="leading-relaxed text-[var(--home-muted)]">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
