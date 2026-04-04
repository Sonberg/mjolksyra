import type { Meta, StoryObj } from "@storybook/react"
import { CoachDashboardSubscriptionSection } from "./CoachDashboardSubscriptionSection"

const starterPlan = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Starter",
  monthlyPriceSek: 399,
  includedAthletes: 10,
  includedCreditsPerCycle: 100,
  extraAthletePriceSek: 39,
  sortOrder: 1,
}

const proPlan = {
  id: "00000000-0000-0000-0000-000000000002",
  name: "Pro",
  monthlyPriceSek: 799,
  includedAthletes: 25,
  includedCreditsPerCycle: 300,
  extraAthletePriceSek: 29,
  sortOrder: 2,
}

const disconnectedStatus = {
  label: "Stripe not connected",
  text: "You need to connect Stripe before you can receive payments.",
  badgeClass: "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
}

const connectedStatus = {
  label: "Stripe connected",
  text: "Payouts and coach billing setup are active.",
  badgeClass: "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
}


const meta = {
  title: "Coach/CoachDashboardSubscriptionSection",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FreeTrial: Story = {
  render: () => (
    <CoachDashboardSubscriptionSection
      coachPaymentStatus={connectedStatus}
      currentPlan={starterPlan}
      plans={[starterPlan, proPlan]}
      overageAthletes={0}
      athleteCount={8}
      isOpeningStripe={false}
      onOpenStripeDashboard={() => {}}
      trialEndsAt={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
      discount={null}
    />
  ),
}

export const PlanNudge: Story = {
  render: () => (
    <CoachDashboardSubscriptionSection
      coachPaymentStatus={connectedStatus}
      currentPlan={starterPlan}
      plans={[starterPlan, proPlan]}
      overageAthletes={5}
      athleteCount={15}
      isOpeningStripe={false}
      onOpenStripeDashboard={() => {}}
      trialEndsAt={null}
      discount={null}
    />
  ),
}

export const StripeNotConnected: Story = {
  render: () => (
    <CoachDashboardSubscriptionSection
      coachPaymentStatus={disconnectedStatus}
      currentPlan={starterPlan}
      plans={[starterPlan, proPlan]}
      overageAthletes={0}
      athleteCount={0}
      isOpeningStripe={false}
      onOpenStripeDashboard={() => {}}
      trialEndsAt={null}
      discount={null}
    />
  ),
}

export const OpeningStripeDashboard: Story = {
  render: () => (
    <CoachDashboardSubscriptionSection
      coachPaymentStatus={connectedStatus}
      currentPlan={starterPlan}
      plans={[starterPlan, proPlan]}
      overageAthletes={0}
      athleteCount={8}
      isOpeningStripe={true}
      onOpenStripeDashboard={() => {}}
      trialEndsAt={null}
      discount={null}
    />
  ),
}

export const WithAppliedDiscount: Story = {
  render: () => (
    <CoachDashboardSubscriptionSection
      coachPaymentStatus={{
        label: "Stripe connected",
        text: "Payouts and coach billing setup are active.",
        badgeClass: "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
      }}
      currentPlan={starterPlan}
      plans={[starterPlan, proPlan]}
      overageAthletes={2}
      athleteCount={12}
      isOpeningStripe={false}
      onOpenStripeDashboard={() => {}}
      trialEndsAt={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
      discount={{
        code: "SPRING50",
        description: "50% off for three months",
      }}
    />
  ),
}

export const WithoutDiscount: Story = {
  render: () => (
    <CoachDashboardSubscriptionSection
      coachPaymentStatus={{
        label: "Stripe connected",
        text: "Payouts and coach billing setup are active.",
        badgeClass: "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
      }}
      currentPlan={starterPlan}
      plans={[starterPlan, proPlan]}
      overageAthletes={0}
      athleteCount={8}
      isOpeningStripe={false}
      onOpenStripeDashboard={() => {}}
      trialEndsAt={null}
      discount={null}
    />
  ),
}
