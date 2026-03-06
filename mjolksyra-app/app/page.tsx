import type { Metadata } from "next";
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
  return (
    <div className="home-shell font-[var(--font-body)] relative min-h-screen overflow-y-auto">
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
          --home-bg: #f6eedf;
          --home-surface: #fff7ec;
          --home-surface-strong: #ecdcc5;
          --home-border: #2a241d;
          --home-text: #161311;
          --home-muted: #5e5448;
          --home-accent: #f03a17;
          --home-accent-ink: #141414;
          --home-accent-2: #151515;
          --font-display: "Alfa Slab One", "Alfa Slab One Fallback";
          background: var(--home-bg);
          color: var(--home-text);
        }

        .dark .home-shell,
        [data-theme="dark"] .home-shell {
          --home-bg: #110e0d;
          --home-surface: #191615;
          --home-surface-strong: #24211e;
          --home-border: #342f2d;
          --home-text: #ede7e4;
          --home-muted: #948d89;
          --home-accent: #ff4520;
          --home-accent-ink: #141414;
          --home-accent-2: #ede7e4;
        }

        .home-glow {
          background:
            radial-gradient(700px 420px at 8% 0%, #f03a1720 0%, transparent 62%),
            radial-gradient(560px 320px at 92% 12%, #00000012 0%, transparent 68%);
        }

        .dark .home-glow,
        [data-theme="dark"] .home-glow {
          background:
            radial-gradient(700px 420px at 8% 0%, #f03a1738 0%, transparent 62%),
            radial-gradient(560px 320px at 92% 12%, #00000020 0%, transparent 68%);
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
