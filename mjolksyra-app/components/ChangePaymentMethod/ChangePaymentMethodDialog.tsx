"use client";

import { useMemo, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";

type Props = {
  open: boolean;
  onClose: () => void;
};

function PaymentForm({ clientSecret, onClose }: { clientSecret: string; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setIsLoading(false);
      return;
    }

    const submitResult = await elements.submit();
    if (submitResult.error) {
      setError(submitResult.error.message || "Please review your payment details.");
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmSetup({
      clientSecret,
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
    });

    if (error) {
      setError(error.message || "An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        onReady={() => setIsReady(true)}
        options={{ layout: { type: "tabs" } }}
      />
      {error ? (
        <p className="text-sm text-[var(--shell-accent)]">{error}</p>
      ) : null}
      {isReady ? (
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)] hover:bg-[var(--shell-surface)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] font-bold text-[var(--shell-accent-ink)] hover:bg-[#ce2f10]"
          >
            {isLoading ? "Saving..." : "Save card"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

export function ChangePaymentMethodDialog({ open, onClose }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { data: clientSecret } = useQuery({
    queryKey: ["stripe", "setup-intent", "change-card"],
    queryFn: async () => {
      const response = await fetch("/api/stripe/setup-intent", { method: "POST" });
      const { clientSecret } = await response.json();
      return `${clientSecret}`;
    },
    enabled: open,
  });

  const stripe = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
    []
  );

  useEffect(() => {
    const redirectStatus = searchParams.get("redirect_status");
    const setupIntentId = searchParams.get("setup_intent");

    if (redirectStatus !== "succeeded" || !setupIntentId) return;

    let cancelled = false;
    setIsSyncing(true);
    setSyncError(null);

    (async () => {
      try {
        const response = await fetch("/api/stripe/setup-intent/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setupIntentId }),
        });

        if (!response.ok) throw new Error("Failed to sync payment status");

        if (cancelled) return;

        const url = new URL(window.location.href);
        url.searchParams.delete("redirect_status");
        url.searchParams.delete("setup_intent");
        url.searchParams.delete("setup_intent_client_secret");
        router.replace(`${url.pathname}${url.search ? url.search : ""}`);
        router.refresh();
        onClose();
      } catch (err) {
        if (cancelled) return;
        setSyncError(err instanceof Error ? err.message : "Failed to sync payment status");
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--shell-ink)]">
          Change payment method
        </h2>
        {isSyncing ? (
          <div className="flex items-center gap-3 text-sm text-[var(--shell-muted)]">
            <Spinner className="stroke-[var(--shell-muted)]" size={20} />
            Finalizing your payment method...
          </div>
        ) : syncError ? (
          <p className="text-sm text-[var(--shell-accent)]">{syncError}</p>
        ) : clientSecret ? (
          <Elements
            key={clientSecret}
            stripe={stripe}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <PaymentForm clientSecret={clientSecret} onClose={onClose} />
          </Elements>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Spinner className="stroke-[var(--shell-muted)]" size={32} />
          </div>
        )}
      </div>
    </div>
  );
}
