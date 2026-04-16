import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import Script from "next/script";
import { HeroSection } from "./components/HeroSection";
import { AudienceSection } from "./components/AudienceSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { FeatureDemosSection } from "./components/FeatureDemosSection";
import { AIFeaturesSection } from "./components/AIFeaturesSection";
import { InsightsSection } from "./components/InsightsSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { CalculatorSection } from "./components/CalculatorSection";
import { BlockBuilderPreviewSection } from "./components/BlockBuilderPreviewSection";
import { MediaUploadSection } from "./components/MediaUploadSection";
import { StripeSection } from "./components/StripeSection";
import { CTASection } from "./components/CTASection";
import { getPlans } from "@/services/plans/getPlans";
import { sortPlans } from "./components/calculatorUtils";
import { getHomeFaqs } from "./components/faqData";

const DemoSection = dynamic(
  () => import("./components/DemoSection").then((module) => module.DemoSection),
  {
    loading: () => (
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="h-72 animate-pulse border border-[var(--home-border)] bg-[var(--home-surface)]" />
        </div>
      </section>
    ),
  },
);

const FAQSection = dynamic(
  () => import("./components/FAQSection").then((module) => module.FAQSection),
);

export const metadata: Metadata = {
  title: "AI Coaching Software for Strength Coaches",
  description:
    "Mjolksyra is AI coaching software for strength coaches. Build training blocks, manage athletes, review workout video, and run your coaching business.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const plans = await getPlans().catch(() => []);
  const primaryPlan = sortPlans(plans)[0] ?? null;
  const faqs = getHomeFaqs(plans);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Mjolksyra",
      url: siteUrl,
      logo: `${siteUrl}/android-chrome-512x512.png`,
      description:
        "Mjolksyra is AI coaching software for strength coaches and online coaching businesses.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Mjolksyra",
      url: siteUrl,
      description:
        "AI coaching software for strength coaches, powerlifting coaches, and athlete management.",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Mjolksyra",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "AI coaching software for building workout plans, managing athletes, analyzing workout video, and delivering coach feedback.",
      offers: primaryPlan
        ? {
            "@type": "Offer",
            price: primaryPlan.monthlyPriceSek,
            priceCurrency: "SEK",
            category: "subscription",
          }
        : undefined,
      audience: {
        "@type": "Audience",
        audienceType: "Strength coaches and online coaches",
      },
      featureList: [
        "AI workout planner with coach approval",
        "Workout video analysis",
        "Athlete messaging and feedback",
        "Drag-and-drop workout planning",
        "Training block management",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <div className="home-shell font-[var(--font-body)] relative min-h-screen overflow-y-auto">
      <Script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="home-glow pointer-events-none fixed inset-0" />

      <div className="home-content relative z-10">
        <HeroSection />
        <AudienceSection />
        <FeaturesSection />
        <FeatureDemosSection />
        <AIFeaturesSection />
        <InsightsSection />
        <MediaUploadSection />
        <BenefitsSection plans={plans} />
        <CalculatorSection plansOverride={plans} />
        <DemoSection />
        <BlockBuilderPreviewSection />
        <StripeSection />
        <FAQSection plans={plans} />
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
