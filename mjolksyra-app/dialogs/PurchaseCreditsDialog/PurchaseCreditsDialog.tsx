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
import { purchaseCreditPack } from "@/services/coaches/purchaseCreditPack";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased?: () => void;
};

export function PurchaseCreditsDialog({ open, onOpenChange, onPurchased }: Props) {
  const queryClient = useQueryClient();
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

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
      await queryClient.invalidateQueries({ queryKey: ["coach-credits"] });
      onOpenChange(false);
      setSelectedPackId(null);
      onPurchased?.();
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!purchase.isPending) {
          onOpenChange(next);
          if (!next) {
            purchase.reset();
            setSelectedPackId(null);
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

        <div className="space-y-2 py-2">
          {packs.isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded border border-[var(--shell-border)] animate-pulse bg-[var(--shell-border)]"
                />
              ))}
            </>
          ) : packs.isError ? (
            <p className="text-xs text-red-500">Could not load credit packs.</p>
          ) : (
            packs.data?.map((pack) => {
              const selected = selectedPackId === pack.id;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`w-full rounded border px-4 py-3 text-left transition ${
                    selected
                      ? "border-[var(--shell-accent)] bg-[var(--shell-accent)]/5"
                      : "border-[var(--shell-border)] hover:border-[var(--shell-accent)]/40"
                  }`}
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
          <p className="text-xs text-red-500">Purchase failed. Please try again.</p>
        ) : null}

        <button
          type="button"
          disabled={!selectedPackId || purchase.isPending}
          onClick={() => purchase.mutate()}
          className="w-full border border-transparent bg-[var(--shell-accent)] px-4 py-2 text-sm font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-50"
        >
          {purchase.isPending ? "Purchasing..." : "Purchase"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
