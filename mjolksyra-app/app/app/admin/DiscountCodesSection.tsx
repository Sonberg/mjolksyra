"use client";

import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import type { DiscountCode } from "@/services/admin/schema";
import type { DiscountType, DiscountDuration } from "@/services/admin/createDiscountCode";
import { useState } from "react";

type Props = {
  initialCodes: DiscountCode[];
};

export function DiscountCodesSection({ initialCodes }: Props) {
  const [codes, setCodes] = useState(initialCodes);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("Percent");
  const [discountValue, setDiscountValue] = useState("");
  const [duration, setDuration] = useState<DiscountDuration>("Forever");
  const [durationInMonths, setDurationInMonths] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");

  async function handleCreate() {
    setError(null);
    const value = parseInt(discountValue, 10);
    const repeatingMonthsInput = Number(durationInMonths);
    const repeatingMonths =
      duration === "Repeating" && Number.isFinite(repeatingMonthsInput)
        ? Math.trunc(repeatingMonthsInput)
        : undefined;

    if (!code.trim() || isNaN(value) || value <= 0) {
      setError("Please fill in all required fields with valid values.");
      return;
    }
    if (duration === "Repeating" && (!repeatingMonths || repeatingMonths <= 0)) {
      setError("Duration in months is required for repeating discounts.");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description: description.trim() ? description.trim() : undefined,
          discountType,
          discountValue: value,
          duration,
          durationInMonths: duration === "Repeating" ? repeatingMonths : undefined,
          maxRedemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.title ?? "Failed to create discount code.");
      }
      const newCode = await res.json();
      setCodes((prev) => [
        ...prev,
        {
          id: newCode.id,
          code: newCode.code,
          description: newCode.description,
          maxRedemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : null,
          redeemedCount: 0,
          isActive: true,
          createdAt: new Date(),
        },
      ]);
      setCode("");
      setDescription("");
      setDiscountValue("");
      setDurationInMonths("");
      setMaxRedemptions("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create discount code.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="mt-8 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
      <div className="mb-4">
        <h2 className="text-lg text-[var(--shell-ink)]">Discount codes</h2>
        <p className="mt-1 text-sm text-[var(--shell-muted)]">
          Create and manage discount codes for coaches. Codes create Stripe coupons applied to the platform subscription.
        </p>
      </div>

      {codes.length > 0 && (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-[var(--shell-border)] text-xs uppercase tracking-[0.08em] text-[var(--shell-muted)]">
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Redemptions</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-[var(--shell-border)]/40 text-sm text-[var(--shell-ink)]">
                  <td className="px-3 py-3 font-mono font-semibold">{c.code}</td>
                  <td className="px-3 py-3">{c.description}</td>
                  <td className="px-3 py-3">
                    {c.redeemedCount} / {c.maxRedemptions ?? "∞"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        c.isActive
                          ? "inline-flex rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-2 py-0.5 text-xs font-semibold text-[var(--shell-surface)]"
                          : "inline-flex rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-0.5 text-xs font-semibold text-[var(--shell-muted)]"
                      }
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[var(--shell-muted)]">
                    {new Date(c.createdAt).toLocaleDateString("sv-SE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
          Create new code
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--shell-muted)]">Code *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="FRIEND2024"
              className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 font-mono text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
            <label className="text-xs text-[var(--shell-muted)]">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Auto-generated if empty"
              className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--shell-muted)]">Type *</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-sm text-[var(--shell-ink)] focus:outline-none"
            >
              <option value="Percent">Percent (%)</option>
              <option value="FixedAmount">Fixed amount (öre)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--shell-muted)]">
              Value * {discountType === "Percent" ? "(0–100)" : "(öre, e.g. 10000 = 100 kr)"}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "Percent" ? "50" : "10000"}
              className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--shell-muted)]">Duration *</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as DiscountDuration)}
              className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-sm text-[var(--shell-ink)] focus:outline-none"
            >
              <option value="Forever">Forever</option>
              <option value="Once">Once</option>
              <option value="Repeating">Repeating</option>
            </select>
          </div>
          {duration === "Repeating" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--shell-muted)]">Duration (months) *</label>
              <input
                type="number"
                value={durationInMonths}
                onChange={(e) => setDurationInMonths(e.target.value)}
                placeholder="3"
                className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--shell-muted)]">Max redemptions (empty = unlimited)</label>
            <input
              type="number"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              placeholder="Unlimited"
              className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:outline-none"
            />
          </div>
        </div>
        {error && <p className="mt-3 text-xs text-[var(--shell-accent)]">{error}</p>}
        <Button
          type="button"
          onClick={handleCreate}
          disabled={isCreating}
          className="mt-4 rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-5 text-sm font-semibold text-[var(--shell-surface)] hover:opacity-80 disabled:opacity-50"
        >
          {isCreating ? <Spinner size={14} /> : "Create"}
        </Button>
      </div>
    </section>
  );
}
