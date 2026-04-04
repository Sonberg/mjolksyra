import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Mjolksyra",
  description:
    "Learn how Mjolksyra collects, uses, and protects your personal data.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="home-shell font-[var(--font-body)] relative min-h-screen overflow-y-auto">
      <div className="home-glow pointer-events-none fixed inset-0" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-24">
        <p
          className="mb-2 text-sm uppercase tracking-widest"
          style={{ color: "var(--home-muted)" }}
        >
          Legal
        </p>
        <h1
          className="mb-2 text-4xl leading-tight"
          style={{ color: "var(--home-text)" }}
        >
          Privacy Policy
        </h1>
        <p className="mb-16 text-sm" style={{ color: "var(--home-muted)" }}>
          Last updated: March 2026
        </p>

        <div className="space-y-12" style={{ color: "var(--home-text)" }}>
          <section>
            <p
              className="leading-relaxed"
              style={{ color: "var(--home-muted)" }}
            >
              Mjolksyra (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates a coaching platform for
              athletes and coaches. This Privacy Policy explains what
              information we collect, how we use it, and what rights you have
              over your data. By using our service you agree to the practices
              described below.
            </p>
          </section>

          <Section title="Information We Collect">
            <p
              className="mb-4 leading-relaxed"
              style={{ color: "var(--home-muted)" }}
            >
              We collect the following categories of information:
            </p>
            <ul className="space-y-3">
              <Li>
                <strong>Account data</strong> — name, email address, and profile
                information you provide when you sign up via Clerk.
              </Li>
              <Li>
                <strong>Payment data</strong> — billing details such as card
                type and last four digits, subscription status, and transaction
                history. Full card numbers are processed exclusively by Stripe
                and never stored on our servers.
              </Li>
              <Li>
                <strong>Usage data</strong> — pages visited, features used,
                session duration, and browser/device metadata collected through
                PostHog analytics.
              </Li>
              <Li>
                <strong>Workout &amp; coaching data</strong> — training plans,
                workout logs, and athlete notes you create or share within the
                platform.
              </Li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <ul className="space-y-3">
              <Li>To provide, operate, and improve the Mjolksyra platform.</Li>
              <Li>
                To process subscription payments and send billing receipts.
              </Li>
              <Li>
                To send transactional emails (e.g. invitation accepted, payment
                failed).
              </Li>
              <Li>
                To analyse product usage and prioritise feature development.
              </Li>
              <Li>To comply with legal obligations and resolve disputes.</Li>
            </ul>
            <p
              className="mt-4 leading-relaxed"
              style={{ color: "var(--home-muted)" }}
            >
              We do not sell your personal data to third parties or use it for
              advertising purposes.
            </p>
          </Section>

          <Section title="Third-Party Services">
            <p
              className="mb-4 leading-relaxed"
              style={{ color: "var(--home-muted)" }}
            >
              We rely on the following sub-processors to deliver the service:
            </p>
            <ul className="space-y-3">
              <Li>
                <strong>Clerk</strong> — authentication and identity management.
                Your login credentials are handled entirely by Clerk.{" "}
                <a
                  href="https://clerk.com/legal/privacy"
                  className="underline underline-offset-2 hover:opacity-70"
                  style={{ color: "var(--home-accent)" }}
                >
                  Clerk Privacy Policy
                </a>
              </Li>
              <Li>
                <strong>Stripe</strong> — payment processing and subscription
                billing. Card data never passes through our servers.{" "}
                <a
                  href="https://stripe.com/privacy"
                  className="underline underline-offset-2 hover:opacity-70"
                  style={{ color: "var(--home-accent)" }}
                >
                  Stripe Privacy Policy
                </a>
              </Li>
              <Li>
                <strong>PostHog</strong> — product analytics. We use PostHog in
                EU-hosted mode. Events are anonymised where possible.{" "}
                <a
                  href="https://posthog.com/privacy"
                  className="underline underline-offset-2 hover:opacity-70"
                  style={{ color: "var(--home-accent)" }}
                >
                  PostHog Privacy Policy
                </a>
              </Li>
            </ul>
          </Section>

          <Section title="Data Retention">
            <p
              className="leading-relaxed"
              style={{ color: "var(--home-muted)" }}
            >
              We retain your account data for as long as your account is active.
              If you delete your account, we will remove your personal data
              within 30 days, except where we are required to retain it by law
              (e.g. financial records for tax purposes, typically 7 years).
              Anonymised, aggregated analytics data may be retained
              indefinitely.
            </p>
          </Section>

          <Section title="Your Rights">
            <p
              className="mb-4 leading-relaxed"
              style={{ color: "var(--home-muted)" }}
            >
              Under GDPR and similar privacy laws you have the right to:
            </p>
            <ul className="space-y-3">
              <Li>
                <strong>Access</strong> — request a copy of the personal data we
                hold about you.
              </Li>
              <Li>
                <strong>Rectification</strong> — ask us to correct inaccurate or
                incomplete data.
              </Li>
              <Li>
                <strong>Erasure</strong> — request deletion of your personal
                data (&quot;right to be forgotten&quot;).
              </Li>
              <Li>
                <strong>Portability</strong> — receive your data in a
                structured, machine-readable format.
              </Li>
              <Li>
                <strong>Restriction</strong> — ask us to limit processing of
                your data in certain circumstances.
              </Li>
              <Li>
                <strong>Objection</strong> — object to processing based on
                legitimate interests.
              </Li>
            </ul>
            <p
              className="mt-4 leading-relaxed"
              style={{ color: "var(--home-muted)" }}
            >
              To exercise any of these rights, contact us at the address below.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="Cookies">
            <p
              className="leading-relaxed"
              style={{ color: "var(--home-muted)" }}
            >
              We use strictly necessary cookies to keep you signed in (managed
              by Clerk) and functional cookies for theme preferences. We use
              analytics cookies via PostHog to understand how the product is
              used. You can opt out of analytics tracking by contacting us or
              using your browser&apos;s cookie controls.
            </p>
          </Section>

          <Section title="Contact">
            <p
              className="leading-relaxed"
              style={{ color: "var(--home-muted)" }}
            >
              If you have questions about this policy or want to exercise your
              rights, reach us at{" "}
              <a
                href="mailto:per.sonberg@gmail.com"
                className="underline underline-offset-2 hover:opacity-70"
                style={{ color: "var(--home-accent)" }}
              >
                per.sonberg@gmail.com
              </a>
              . We are the data controller for personal data processed through
              the Mjolksyra platform.
            </p>
          </Section>
        </div>
      </div>

    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className="mb-4 text-xl"
        style={{ color: "var(--home-text)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li
      className="flex gap-2 leading-relaxed"
      style={{ color: "var(--home-muted)" }}
    >
      <span
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: "var(--home-accent)" }}
      />
      <span>{children}</span>
    </li>
  );
}
