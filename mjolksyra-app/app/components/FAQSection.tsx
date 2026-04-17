import type { Plan } from "@/services/plans/type";
import { getHomeFaqs } from "./faqData";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FAQSectionProps = {
  plans?: Plan[];
};

export const FAQSection = ({ plans = [] }: FAQSectionProps) => {
  const faqs = getHomeFaqs(plans);

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="font-[var(--font-display)] mb-12 text-center text-3xl font-semibold text-[var(--home-text)] md:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-3xl">
          <Separator />
          <Accordion type="single" collapsible>
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="border-b border-[var(--home-border)]">
                <AccordionTrigger className="py-5 text-left font-[var(--font-display)] text-base font-semibold text-[var(--home-text)] hover:no-underline [&>svg]:text-[var(--home-muted)]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[var(--home-muted)]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
