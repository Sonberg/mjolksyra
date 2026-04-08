import type { Plan } from "@/services/plans/type";
import { FALLBACK_CALCULATOR_PLAN, sortPlans } from "./calculatorUtils";

export type HomeFaqItem = {
  question: string;
  answer: string;
};

export function getHomeFaqs(plans: Plan[] = []): HomeFaqItem[] {
  const plan = sortPlans(plans)[0] ?? FALLBACK_CALCULATOR_PLAN;

  return [
    {
      question: "How do payments work?",
      answer: `Coaches pay a platform subscription of ${plan.monthlyPriceSek.toLocaleString("en-US")} kr/month (SEK), which includes up to ${plan.includedAthletes} athletes. Additional active athletes cost ${plan.extraAthletePriceSek} kr per athlete per month. Athlete invitations and billing setup are handled through secure flows.`,
    },
    {
      question: "Do I need to be a certified trainer?",
      answer:
        "While certification is not required to use our platform, we encourage all coaches to operate within their expertise and follow local regulations regarding fitness coaching.",
    },
    {
      question: "How many athletes can I coach?",
      answer: `Your plan includes ${plan.includedAthletes} athletes. You can add more anytime for ${plan.extraAthletePriceSek} kr per additional active athlete per month.`,
    },
    {
      question: "What does Mjölksyra mean?",
      answer:
        "Mjölksyra is the Swedish word for lactic acid — the burn you feel in your muscles when you push hard. We chose it because it represents effort, discomfort, and growth. The things good coaching is built on.",
    },
    {
      question: "Can coaches from any country sign up?",
      answer:
        "Yes, coaches from all countries are welcome. The platform is in English and payments are processed through Stripe, which supports coaches and athletes worldwide. Pricing is in Swedish Kronor (SEK) and Stripe handles currency conversion automatically.",
    },
    {
      question: "Can I customize workout plans?",
      answer:
        "Absolutely. Coaches can build drag-and-drop workout plans, reuse templates, and use the AI planner to propose new blocks or edits before approving them.",
    },
    {
      question: "What's the onboarding process like?",
      answer:
        "Getting started is simple: create an account, set up your Stripe connection for payments, and start inviting athletes. We'll guide you through each step.",
    },
  ];
}
