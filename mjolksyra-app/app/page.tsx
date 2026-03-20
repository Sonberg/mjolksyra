import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HeroSection } from "./components/HeroSection";
import { AudienceSection } from "./components/AudienceSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { FeatureDemosSection } from "./components/FeatureDemosSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { CalculatorSection } from "./components/CalculatorSection";
import { BlockBuilderPreviewSection } from "./components/BlockBuilderPreviewSection";
import { StripeSection } from "./components/StripeSection";
import { CTASection } from "./components/CTASection";
import { getPlans } from "@/services/plans/getPlans";

const DemoSection = dynamic(
  () => import("./components/DemoSection").then((module) => module.DemoSection),
  {
    loading: () => (
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="h-72 animate-pulse border-2 border-[var(--home-border)] bg-[var(--home-surface)]" />
        </div>
      </section>
    ),
  },
);

const FAQSection = dynamic(
  () => import("./components/FAQSection").then((module) => module.FAQSection),
);

export const metadata: Metadata = {
  title: "Coaching Platform for Athletes and Coaches",
  description:
    "Build training blocks, manage athletes, and run your coaching business with Mjolksyra.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const plans = await getPlans().catch(() => []);

  return (
    <div className="home-shell font-[var(--font-body)] relative min-h-screen overflow-y-auto">
      <div className="home-glow pointer-events-none fixed inset-0" />

      <div className="home-content relative z-10">
        <HeroSection />
        <AudienceSection />
        <FeaturesSection />
        <FeatureDemosSection />
        <BenefitsSection plans={plans} />
        <CalculatorSection plansOverride={plans} />
        <DemoSection />
        <BlockBuilderPreviewSection />
        <StripeSection />
        <FAQSection />
        <CTASection />

        <footer className="pb-10 text-center text-sm" style={{ color: "var(--home-muted)" }}>
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
            Privacy Policy
          </Link>
        </footer>
      </div>

    </div>
  );
}
