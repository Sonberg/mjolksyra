"use client";

type Props = {
  code: string | null;
  description: string | null;
  stripeCouponId: string | null;
  stripeCoupon?: {
    name?: string | null;
    percentOff?: number | null;
    amountOff?: number | null;
    currency?: string | null;
    duration?: string | null;
    durationInMonths?: number | null;
    valid?: boolean | null;
  } | null;
  stripePromotionCodeId?: string | null;
};

export function AppliedDiscountCard({
  code,
  description,
  stripeCouponId,
  stripeCoupon,
  stripePromotionCodeId,
}: Props) {
  const stripeSummary = stripeCoupon
    ? `${
        stripeCoupon.percentOff != null
          ? `${stripeCoupon.percentOff}% off`
          : stripeCoupon.amountOff != null
            ? `${stripeCoupon.amountOff} ${stripeCoupon.currency?.toUpperCase() ?? ""} off`
            : "discount configured"
      } · ${stripeCoupon.duration ?? "duration unknown"}${stripeCoupon.durationInMonths != null ? ` (${stripeCoupon.durationInMonths} months)` : ""} · ${stripeCoupon.valid == null ? "status unknown" : stripeCoupon.valid ? "valid" : "invalid"}`
    : null;

  return (
    <div className="mt-2 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs">
      <p className="uppercase tracking-[0.16em] text-[var(--shell-muted)]">
        Applied
      </p>
      {code ? (
        <>
          <p className="mt-1 text-sm font-semibold text-[var(--shell-ink)]">
            {code}
            {description ? ` - ${description}` : ""}
          </p>

          {stripeCoupon ? (
            <div className="text-xs mt-4 text-[var(--shell-muted)]">
              {stripeSummary ? (
                <p className="mt-1 inline-block text-[var(--shell-ink)]">
                  {stripeSummary}
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <p className="mt-1 text-sm text-[var(--shell-muted)]">
          No active discount
        </p>
      )}
    </div>
  );
}
