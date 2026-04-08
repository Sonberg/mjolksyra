"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { Plan } from "@/services/plans/type";
import { cn } from "@/lib/utils";
import { getHomeFaqs } from "./faqData";

type FAQSectionProps = {
  plans?: Plan[];
};

export const FAQSection = ({ plans = [] }: FAQSectionProps) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const faqs = getHomeFaqs(plans);

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="font-[var(--font-display)] mb-12 text-center text-3xl font-semibold text-[var(--home-text)] md:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-3xl border-t border-[var(--home-border)]">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="border-b border-[var(--home-border)]">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-[var(--font-display)] text-base font-semibold text-[var(--home-text)]">
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
