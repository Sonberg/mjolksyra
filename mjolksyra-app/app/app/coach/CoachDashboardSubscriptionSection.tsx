"use client";

import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAppliedDiscountCode } from "@/services/coaches/getAppliedDiscountCode";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Plan } from "@/services/plans/type";
import { CoachPlanSelector } from "./CoachPlanSelector";
import { CoachPlanNudge } from "./CoachPlanNudge";
import { AppliedDiscountCard } from "./AppliedDiscountCard";

type CoachPaymentStatus = {
  label: string;
  text: string;
  badgeClass: string;
};

type Props = {
  coachPaymentStatus: CoachPaymentStatus;
  currentPlan: Plan;
  plans: Plan[];
  overageAthletes: number;
  athleteCount: number;
  isOpeningStripe: boolean;
  onOpenStripeDashboard: () => Promise<void> | void;
  trialEndsAt?: Date | null;
  discount?: {
    code?: string | null;
    description?: string | null;
  } | null;
};

export function CoachDashboardSubscriptionSection({
  coachPaymentStatus,
  currentPlan,
  plans,
  overageAthletes,
  athleteCount,
  isOpeningStripe,
  onOpenStripeDashboard,
  trialEndsAt,
  discount,
}: Props) {
  const queryClient = useQueryClient();
  const overageTotalSek = overageAthletes * currentPlan.extraAthletePriceSek;
  const estimatedTotalSek = currentPlan.monthlyPriceSek + overageTotalSek;

  const now = new Date();
  const isTrialing = trialEndsAt != null && trialEndsAt > now;
  const trialDaysRemaining = isTrialing
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [discountMessage, setDiscountMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeDiscountCode, setActiveDiscountCode] = useState<string | null>(null);
  const [activeDiscountDescription, setActiveDiscountDescription] = useState<string | null>(null);
  const [activeDiscountStripeCouponId, setActiveDiscountStripeCouponId] = useState<string | null>(null);

  const { data: liveDiscount } = useQuery({
    queryKey: ["coach-applied-discount"],
    queryFn: getAppliedDiscountCode,
  });

  const effectiveDiscountCode = activeDiscountCode ?? liveDiscount?.code ?? discount?.code ?? null;
  const effectiveDiscountDescription = activeDiscountDescription ?? liveDiscount?.description ?? discount?.description ?? null;
  const effectiveDiscountStripeCouponId = activeDiscountStripeCouponId ?? liveDiscount?.stripeCouponId ?? null;

  async function handleApplyCode() {
    if (!discountCode.trim()) return;
    setIsApplyingCode(true);
    setDiscountMessage(null);
    try {
      const res = await fetch("/api/coaches/discount-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode.trim() }),
      });
      if (res.ok) {
        setDiscountMessage({ type: "success", text: "Discount applied to your subscription." });
        setActiveDiscountCode(discountCode.trim());
        setActiveDiscountDescription(null);
        setActiveDiscountStripeCouponId(null);
        setDiscountCode("");
        await queryClient.invalidateQueries({ queryKey: ["coach-applied-discount"] });
      } else if (res.status === 404) {
        setDiscountMessage({ type: "error", text: "Discount code not found." });
      } else {
        const body = await res.json().catch(() => ({}));
        setDiscountMessage({ type: "error", text: body?.error ?? "Discount code is no longer valid." });
      }
    } catch {
      setDiscountMessage({ type: "error", text: "Failed to apply discount code." });
    } finally {
      setIsApplyingCode(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageSectionHeader
        eyebrow="Payments"
        title="Coach subscription"
        description="Manage your Stripe connection, payouts, and monthly platform charge."
        actions={
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-none border px-2.5 py-1 text-xs font-semibold",
              coachPaymentStatus.badgeClass,
            )}
          >
            {coachPaymentStatus.label}
          </span>
        }
      />

      {isTrialing && (
        <p className="border-l-2 border-[var(--shell-accent)] pl-3 text-sm text-[var(--shell-ink)]">
          Free trial active. Your first charge starts on{" "}
          <span className="font-semibold">{trialEndsAt!.toLocaleDateString("sv-SE")}</span>{" "}
          ({trialDaysRemaining} day{trialDaysRemaining === 1 ? "" : "s"} remaining).
        </p>
      )}

      <CoachPlanNudge currentPlan={currentPlan} plans={plans} athleteCount={athleteCount} />

      {/* Plan selector */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Plan</p>
        <div className="mt-3">
          <CoachPlanSelector plans={plans} currentPlanId={currentPlan.id} athleteCount={athleteCount} />
        </div>
      </div>

      {/* Monthly charge */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Monthly platform charge</p>
        <div className="mt-3 grid grid-cols-3 gap-6 sm:max-w-sm">
          <div>
            <p className="text-xs text-[var(--shell-muted)]">Base plan</p>
            <p className="mt-1 text-xl font-semibold text-[var(--shell-ink)]">{currentPlan.monthlyPriceSek} kr</p>
          </div>
          <div>
            <p className="text-xs text-[var(--shell-muted)]">Overage</p>
            <p className="mt-1 text-xl font-semibold text-[var(--shell-ink)]">{overageTotalSek} kr</p>
            <p className="text-xs text-[var(--shell-muted)]">{overageAthletes} × {currentPlan.extraAthletePriceSek} kr</p>
          </div>
          <div>
            <p className="text-xs text-[var(--shell-muted)]">Total</p>
            <p className="mt-1 text-xl font-semibold text-[var(--shell-ink)]">{estimatedTotalSek} kr</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--shell-muted)]">
          Includes {currentPlan.includedAthletes} athletes. Overage is synced to Stripe as active athletes above {currentPlan.includedAthletes}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Discount code */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Discount code</p>
          <div className="mt-3">
            <AppliedDiscountCard
              code={effectiveDiscountCode}
              description={effectiveDiscountDescription}
              stripeCouponId={effectiveDiscountStripeCouponId}
              stripePromotionCodeId={liveDiscount?.stripePromotionCodeId ?? null}
              stripeCoupon={liveDiscount?.stripeCoupon ?? null}
            />
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 border-b border-[var(--shell-border)] bg-transparent py-1.5 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleApplyCode}
                disabled={isApplyingCode || !discountCode.trim()}
                className="rounded-none border border-transparent bg-[var(--shell-accent)] px-4 text-sm font-semibold text-[var(--shell-accent-ink)] hover:opacity-90 disabled:opacity-50"
              >
                {isApplyingCode ? <Spinner size={14} /> : "Apply"}
              </Button>
            </div>
            {discountMessage && (
              <p className={cn("mt-2 text-xs", discountMessage.type === "success" ? "text-green-600" : "text-[var(--shell-accent)]")}>
                {discountMessage.text}
              </p>
            )}
          </div>
        </div>

        {/* Stripe account */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Stripe account</p>
          <p className="mt-3 text-sm text-[var(--shell-ink)]">{coachPaymentStatus.text}</p>
          <Button
            type="button"
            onClick={onOpenStripeDashboard}
            disabled={isOpeningStripe}
            className="mt-3 rounded-none border border-transparent bg-[var(--shell-accent)] px-4 py-2 font-semibold text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent-hover)] disabled:opacity-60"
          >
            {isOpeningStripe ? <Spinner size={14} /> : "Open Stripe"}
          </Button>
          <p className="mt-2 text-xs text-[var(--shell-muted)]">
            Use Stripe to review payouts and update account settings.
          </p>
          <p className="mt-3 text-xs text-[var(--shell-muted)]">
            Credit balance and usage details are available in the{" "}
            <Link href="/app/coach/credits" className="underline underline-offset-2">
              Credits tab
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
