import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { HeroSection } from "./components/HeroSection";
import { AudienceSection } from "./components/AudienceSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { CalculatorSection } from "./components/CalculatorSection";
import { DemoSection } from "./components/DemoSection";
import { BlockBuilderPreviewSection } from "./components/BlockBuilderPreviewSection";
import { StripeSection } from "./components/StripeSection";
import { FAQSection } from "./components/FAQSection";
import { CTASection } from "./components/CTASection";

export const metadata: Metadata = {
  title: "Coaching Platform for Athletes and Coaches",
  description:
    "Build training blocks, manage athletes, and run your coaching business with Mjolksyra.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const themeVars = {
    "--home-bg": "#f6eedf",
    "--home-surface": "#fff7ec",
    "--home-border": "#2a241d",
    "--home-text": "#161311",
    "--home-muted": "#5e5448",
    "--home-accent": "#f03a17",
    "--home-accent-2": "#151515",
  } as CSSProperties;

  return (
    <div
      style={themeVars}
      className="home-shell font-[var(--font-body)] relative min-h-screen overflow-y-auto"
    >
      <div className="home-grid-overlay pointer-events-none fixed inset-0" />
      <div className="home-glow pointer-events-none fixed inset-0" />

      <div className="home-content relative z-10">
        <HeroSection />
        <AudienceSection />
        <FeaturesSection />
        <BenefitsSection />
        <CalculatorSection />
        <DemoSection />
        <BlockBuilderPreviewSection />
        <StripeSection />
        <FAQSection />
        <CTASection />
      </div>

      <style>{`
        .home-shell {
          background: var(--home-bg);
          color: var(--home-text);
        }

        .home-grid-overlay {
          background:
            repeating-linear-gradient(90deg, #00000010 0 1px, #0000 1px 44px),
            repeating-linear-gradient(180deg, #00000008 0 1px, #0000 1px 44px);
          opacity: 0.55;
        }

        .home-glow {
          background:
            radial-gradient(700px 420px at 8% 0%, #f03a1720 0%, transparent 62%),
            radial-gradient(560px 320px at 92% 12%, #00000012 0%, transparent 68%);
        }

        .home-content {
          animation: homeEnter 520ms cubic-bezier(.2,.7,.1,1) both;
        }

        @keyframes homeEnter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
