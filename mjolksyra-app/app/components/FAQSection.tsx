"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How do payments work?",
    answer: "Coaches pay a platform subscription of $39/month, which includes up to 10 athletes. Additional active athletes cost $4 per athlete per month. Athlete invitations and billing setup are handled through secure flows.",
  },
  {
    question: "Do I need to be a certified trainer?",
    answer: "While certification is not required to use our platform, we encourage all coaches to operate within their expertise and follow local regulations regarding fitness coaching.",
  },
  {
    question: "How many athletes can I coach?",
    answer: "Your plan includes 10 athletes. You can add more anytime for $4 per additional active athlete per month.",
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

export const FAQSection = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="font-[var(--font-display)] mb-12 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-center text-3xl font-semibold text-transparent md:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto grid max-w-3xl gap-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                {openFaqIndex === index ? (
                  <MinusIcon className="h-5 w-5 text-zinc-400" />
                ) : (
                  <PlusIcon className="h-5 w-5 text-zinc-400" />
                )}
              </button>
              {openFaqIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-zinc-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 
