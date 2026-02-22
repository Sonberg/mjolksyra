"use client";

import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { CalculatorSection } from "./components/CalculatorSection";
import { DemoSection } from "./components/DemoSection";
import { BlockBuilderPreviewSection } from "./components/BlockBuilderPreviewSection";
import { StripeSection } from "./components/StripeSection";
import { FAQSection } from "./components/FAQSection";
import { CTASection } from "./components/CTASection";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-y-auto bg-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_90%_15%,rgba(16,185,129,0.06),transparent_30%)]" />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <CalculatorSection />
      <DemoSection />
      <BlockBuilderPreviewSection />
      <StripeSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
