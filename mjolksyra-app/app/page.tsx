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
    <div className="overflow-y-auto bg-black min-h-screen">
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
