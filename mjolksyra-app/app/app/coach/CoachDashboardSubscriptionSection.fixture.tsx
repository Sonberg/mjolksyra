import { CoachDashboardSubscriptionSection } from "./CoachDashboardSubscriptionSection";

const starterPlan = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Starter",
  monthlyPriceSek: 399,
  includedAthletes: 10,
  extraAthletePriceSek: 39,
  sortOrder: 1,
};

const proPlan = {
  id: "00000000-0000-0000-0000-000000000002",
  name: "Pro",
  monthlyPriceSek: 799,
  includedAthletes: 25,
  extraAthletePriceSek: 29,
  sortOrder: 2,
};

export default {
  WithAppliedDiscount: () => (
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

  WithoutDiscount: () => (
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
};
