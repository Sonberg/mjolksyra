"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

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

export const FAQSection = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
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
  );
}; 