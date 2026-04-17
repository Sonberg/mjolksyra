import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getCreditPacks } from "@/services/creditPacks/getCreditPacks";
import { getCreditLedger } from "@/services/coaches/getCreditLedger";
import { getCredits } from "@/services/coaches/getCredits";
import { purchaseCreditPack } from "@/services/coaches/purchaseCreditPack";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased?: () => void;
};

export function PurchaseCreditsDialog({ open, onOpenChange, onPurchased }: Props) {
  const queryClient = useQueryClient();
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [purchaseState, setPurchaseState] = useState<
    "idle" | "waiting_for_grant" | "succeeded" | "timed_out"
  >("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const packs = useQuery({
    queryKey: ["credit-packs"],
    queryFn: getCreditPacks,
    enabled: open,
  });

  const purchase = useMutation({
    mutationFn: () => {
      if (!selectedPackId) throw new Error("No pack selected");
      return purchaseCreditPack(selectedPackId);
    },
    onSuccess: async () => {
      setPurchaseState("waiting_for_grant");
      setStatusMessage("Payment submitted. Waiting for credits to be added...");

      const selectedPack = packs.data?.find((pack) => pack.id === selectedPackId) ?? null;
      const creditsBefore =
        queryClient.getQueryData<{ totalRemaining: number; purchasedRemaining: number }>(["coach-credits"]);
      const ledgerBefore =
        queryClient.getQueryData<Array<{ id: string; type: string }>>(["coach-credit-ledger"]) ?? [];
      const latestLedgerId = ledgerBefore[0]?.id ?? null;

      let grantDetected = false;

      for (let attempt = 0; attempt < 8; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 1000));

        const [credits, ledger] = await Promise.all([
          queryClient.fetchQuery({
            queryKey: ["coach-credits"],
            queryFn: getCredits,
          }),
          queryClient.fetchQuery({
            queryKey: ["coach-credit-ledger"],
            queryFn: () => getCreditLedger({ limit: 50 }),
          }),
        ]);

        const creditsIncreased =
          credits.totalRemaining > (creditsBefore?.totalRemaining ?? 0) ||
          credits.purchasedRemaining > (creditsBefore?.purchasedRemaining ?? 0);
        const hasNewPurchaseEntry = ledger.some(
          (entry) =>
            entry.type === "Purchase" &&
            (latestLedgerId === null || entry.id !== latestLedgerId),
        );

        if (creditsIncreased || hasNewPurchaseEntry) {
          grantDetected = true;
          break;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["coach-credits"] });
      await queryClient.invalidateQueries({ queryKey: ["coach-credit-ledger"] });

      if (grantDetected) {
        setPurchaseState("succeeded");
        setStatusMessage(
          selectedPack
            ? `${selectedPack.credits} credits added successfully.`
            : "Credits added successfully.",
        );
        onPurchased?.();

        window.setTimeout(() => {
          onOpenChange(false);
          setSelectedPackId(null);
          setPurchaseState("idle");
          setStatusMessage(null);
        }, 1200);
        return;
      }

      setPurchaseState("timed_out");
      setStatusMessage(
        "Payment request was accepted, but credits have not appeared yet. This can take a moment while Stripe webhook processing finishes.",
      );
    },
    onError: () => {
      setPurchaseState("idle");
      setStatusMessage(null);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!purchase.isPending && purchaseState !== "waiting_for_grant") {
          onOpenChange(next);
          if (!next) {
            purchase.reset();
            setSelectedPackId(null);
            setPurchaseState("idle");
            setStatusMessage(null);
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Purchase credits</DialogTitle>
          <DialogDescription>
            Credits are used for AI analysis. Choose a pack to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          {packs.isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded" />
              ))}
            </>
          ) : packs.isError ? (
            <p className="text-xs text-destructive">Could not load credit packs.</p>
          ) : (
            packs.data?.map((pack) => {
              const selected = selectedPackId === pack.id;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setSelectedPackId(pack.id)}
                  className={cn(
                    "w-full rounded border px-4 py-3 text-left transition",
                    selected
                      ? "border-[var(--shell-accent)] bg-[var(--shell-accent)]/5"
                      : "border-[var(--shell-border)] hover:border-[var(--shell-accent)]/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--shell-ink)]">
                      {pack.name}
                    </span>
                    <span className="text-sm font-semibold text-[var(--shell-ink)]">
                      {pack.priceSek} kr
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
                    {pack.credits} credits
                  </p>
                </button>
              );
            })
          )}
        </div>

        {purchase.isError ? (
          <p className="text-xs text-destructive">Purchase failed. Please try again.</p>
        ) : null}

        {statusMessage ? (
          <p
            className={
              purchaseState === "succeeded"
                ? "text-xs text-green-600"
                : purchaseState === "timed_out"
                  ? "text-xs text-[var(--shell-muted)]"
                  : "text-xs text-[var(--shell-muted)]"
            }
          >
            {statusMessage}
          </p>
        ) : null}

        <button
          type="button"
          disabled={!selectedPackId || purchase.isPending || purchaseState === "waiting_for_grant"}
          onClick={() => purchase.mutate()}
          className="w-full border border-transparent bg-[var(--shell-accent)] px-4 py-2 text-sm font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-50"
        >
          {purchase.isPending
            ? "Purchasing..."
            : purchaseState === "waiting_for_grant"
              ? "Waiting for credits..."
              : purchaseState === "succeeded"
                ? "Credits added"
                : "Purchase"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
