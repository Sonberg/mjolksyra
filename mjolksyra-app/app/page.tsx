"use client";

import type { CSSProperties } from "react";
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
  const themeVars = {
    "--home-bg": "#090909",
    "--home-surface": "#111111",
    "--home-border": "#2b2b2b",
    "--home-text": "#f3f3f3",
    "--home-muted": "#9a9a9a",
    "--home-accent": "#ededed",
    "--home-accent-2": "#cfcfcf",
  } as CSSProperties;

  return (
    <div
      style={themeVars}
      className="font-[var(--font-body)] relative min-h-screen overflow-y-auto [background:var(--home-bg)]"
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(255,255,255,0.09),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.05),transparent_30%)]" />
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
