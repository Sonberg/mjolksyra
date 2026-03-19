"use client";

import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCreditPacks } from "@/services/aiCreditPacks/getCreditPacks";
import { purchaseCreditPack } from "@/services/coaches/purchaseCreditPack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function UserCreditPurchase() {
  const queryClient = useQueryClient();
  const [purchasedPackId, setPurchasedPackId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: packs = [], isLoading } = useQuery({
    queryKey: ["ai-credit-packs"],
    queryFn: getCreditPacks,
  });

  const mutation = useMutation({
    mutationFn: (packId: string) => purchaseCreditPack(packId),
    onSuccess: () => {
      setPurchasedPackId(null);
      setSuccessMessage("Purchase initiated. Credits will be added shortly.");
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ["coach-ai-credits"] });
    },
    onError: () => {
      setPurchasedPackId(null);
      setErrorMessage("Purchase failed. Please try again.");
      setSuccessMessage(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--shell-muted)]">
        <Spinner size={12} /> Loading packs…
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--shell-muted)]">Buy more credits</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {packs.map((pack) => {
          const isPending = purchasedPackId === pack.id && mutation.isPending;
          return (
            <div
              key={pack.id}
              className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-3 flex flex-col gap-1"
            >
              <p className="text-sm font-semibold text-[var(--shell-ink)]">{pack.name}</p>
              <p className="text-xs text-[var(--shell-muted)]">{pack.credits} credits</p>
              <p className="text-sm font-semibold text-[var(--shell-ink)]">{pack.priceSek} kr</p>
              <Button
                type="button"
                disabled={mutation.isPending}
                onClick={() => {
                  setPurchasedPackId(pack.id);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                  mutation.mutate(pack.id);
                }}
                className={cn(
                  "mt-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-3 py-1.5 text-xs font-semibold text-[var(--shell-surface)] hover:opacity-80 disabled:opacity-50",
                )}
              >
                {isPending ? <Spinner size={12} /> : "Buy"}
              </Button>
            </div>
          );
        })}
      </div>
      {successMessage && (
        <p className="mt-2 text-xs text-green-600">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="mt-2 text-xs text-[var(--shell-accent)]">{errorMessage}</p>
      )}
    </div>
  );
}
