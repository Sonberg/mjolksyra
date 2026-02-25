"use client";

import { Trainee } from "@/services/trainees/type";
import {
  CreditCardIcon,
  DumbbellIcon,
  MoreHorizontalIcon,
  PencilIcon,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useGravatar } from "@/hooks/useGravatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";
import { chargeTrainee } from "@/services/trainees/chargeTrainee";
import { updateTraineeCost } from "@/services/trainees/updateTraineeCost";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type TraineeCardProps = {
  trainee: Trainee;
};

export function TraineeCard({ trainee }: TraineeCardProps) {
  const router = useRouter();
  const url = useGravatar(trainee.athlete.email ?? "", 56);
  const initialPrice = useMemo(
    () => (trainee.cost?.total != null ? `${trainee.cost.total}` : ""),
    [trainee.cost?.total],
  );
  const [price, setPrice] = useState(initialPrice);
  const [isPriceEditorOpen, setPriceEditorOpen] = useState(false);
  const [isActionsOpen, setActionsOpen] = useState(false);

  useEffect(() => {
    setPrice(initialPrice);
  }, [initialPrice]);
  const cancel = useMutation({
    mutationKey: ["trainee", trainee.id, "cancel"],
    mutationFn: () => cancelTrainee({ traineeId: trainee.id }),
    onSettled: () => router.refresh(),
  });
  const savePrice = useMutation({
    mutationKey: ["trainee", trainee.id, "cost"],
    mutationFn: async () => {
      const amount = Number.parseInt(price, 10);
      if (!Number.isFinite(amount) || amount < 0) {
        throw new Error("Invalid price");
      }
      await updateTraineeCost({ traineeId: trainee.id, amount });
    },
    onSettled: () => router.refresh(),
  });
  const chargeNow = useMutation({
    mutationKey: ["trainee", trainee.id, "charge-now"],
    mutationFn: () => chargeTrainee({ traineeId: trainee.id }),
    onSettled: () => router.refresh(),
  });

  const billingBadge = useMemo(() => {
    const fallbackHasPrice = (trainee.cost?.coach ?? 0) > 0;
    const effectiveStatus =
      trainee.billing.status === "PriceNotSet" && fallbackHasPrice
        ? "PriceSet"
        : trainee.billing.status;

    switch (effectiveStatus) {
      case "SubscriptionActive":
        return {
          label: "Subscription active",
          hint: "Recurring billing is active.",
          className: "border-emerald-800 bg-emerald-950 text-emerald-200",
        };
      case "AwaitingAthletePaymentMethod":
        return {
          label: "Payment method not setup",
          hint: "Athlete must complete payment setup to start billing.",
          className: "border-amber-800 bg-amber-950 text-amber-200",
        };
      case "AwaitingCoachStripeSetup":
        return {
          label: "Coach Stripe not setup",
          hint: "Complete Stripe onboarding to enable billing.",
          className: "border-amber-800 bg-amber-950 text-amber-200",
        };
      case "PriceSet":
        return {
          label: "Price set (waiting setup)",
          hint: "Price is saved. Billing starts when payment and Stripe setup are ready.",
          className: "border-zinc-700 bg-zinc-900 text-zinc-200",
        };
      case "PriceNotSet":
      default:
        return {
          label: "Price not set",
          hint: "Set a monthly price to prepare billing.",
          className: "border-zinc-800 bg-zinc-900 text-zinc-300",
        };
    }
  }, [trainee.billing.status, trainee.cost?.coach]);

  const canChargeNow = useMemo(() => {
    const hasPrice = (trainee.cost?.total ?? 0) > 0;
    const paymentReady =
      trainee.billing.status === "SubscriptionActive" ||
      trainee.billing.status === "PriceSet";

    return hasPrice && paymentReady;
  }, [trainee.billing.status, trainee.cost?.total]);

  const metrics = [
    {
      label: "Next workout",
      value: trainee.nextWorkoutAt
        ? format(new Date(trainee.nextWorkoutAt), "MMM d")
        : "--",
    },
    {
      label: "Last workout",
      value: trainee.lastWorkoutAt
        ? format(new Date(trainee.lastWorkoutAt), "MMM d")
        : "--",
    },
    {
      label: "Last charged",
      value: trainee.billing.lastChargedAt
        ? format(new Date(trainee.billing.lastChargedAt), "MMM d")
        : "--",
    },
    {
      label: "Next charge",
      value: trainee.billing.nextChargedAt
        ? format(new Date(trainee.billing.nextChargedAt), "MMM d")
        : "--",
    },
  ];

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-start gap-4 px-5 py-5 md:px-6">
        <Avatar className="h-12 w-12 border border-zinc-700">
          <AvatarImage src={url} alt={trainee.athlete.name} />
          <AvatarFallback className="bg-zinc-800 text-zinc-100">
            {trainee.athlete.givenName?.[0] || trainee.athlete.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-zinc-100 transition-colors group-hover:text-white">
            {trainee.athlete.givenName
              ? `${trainee.athlete.givenName} ${
                  trainee.athlete.familyName || ""
                }`
              : trainee.athlete.name}
          </h3>
          <p className="truncate text-sm text-zinc-400">
            {trainee.athlete.email}
          </p>
          <div className="mt-2">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
                billingBadge.className,
              )}
            >
              {billingBadge.label}
            </span>
            <p className="mt-1 text-xs text-zinc-500">{billingBadge.hint}</p>
          </div>
        </div>
        <DropdownMenu
          modal={false}
          open={isActionsOpen}
          onOpenChange={setActionsOpen}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 transition hover:bg-zinc-800"
              aria-label="Open actions"
            >
              <MoreHorizontalIcon className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 border-zinc-700 bg-zinc-950 text-zinc-100"
          >
            <DropdownMenuItem
              onSelect={() => {
                setActionsOpen(false);
                setPriceEditorOpen(true);
              }}
              className="cursor-pointer focus:bg-zinc-900 focus:text-zinc-100"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Change price
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={chargeNow.isPending || !canChargeNow}
              onSelect={() => {
                setActionsOpen(false);
                chargeNow.mutateAsync();
              }}
              className="cursor-pointer focus:bg-zinc-900 focus:text-zinc-100"
            >
              <CreditCardIcon className="mr-2 h-4 w-4" />
              {chargeNow.isPending ? "Charging..." : "Charge now (reset cycle)"}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={cancel.isPending}
              onSelect={() => {
                setActionsOpen(false);
                cancel.mutateAsync();
              }}
              className="cursor-pointer focus:bg-zinc-900 focus:text-zinc-100"
            >
              <XIcon className="mr-2 h-4 w-4" />
              {cancel.isPending ? "Cancelling..." : "Cancel relationship"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-3 border-y border-zinc-800 bg-zinc-950 px-5 py-4 md:grid-cols-4 md:px-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-center"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              {metric.label}
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-100">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 bg-zinc-950 px-5 py-4 md:px-6">
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          onClick={() =>
            router.push(`/app/coach/athletes/${trainee.id}/planner`)
          }
        >
          <DumbbellIcon className="h-4 w-4" />
          Plan workouts
        </button>
      </div>

      <Dialog open={isPriceEditorOpen} onOpenChange={setPriceEditorOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change price</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Set the monthly coaching price charged to the athlete.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label
              htmlFor={`trainee-price-dialog-${trainee.id}`}
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500"
            >
              Monthly price (SEK)
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`trainee-price-dialog-${trainee.id}`}
                inputMode="numeric"
                pattern="[0-9]*"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="1000"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-zinc-600"
              />
              <span className="text-sm text-zinc-400">SEK/mo</span>
            </div>
            <div className="rounded-xl border border-amber-900/70 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
              Saving a new price charges the athlete immediately and resets the
              monthly billing date.
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPriceEditorOpen(false)}
              className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={savePrice.isPending || price.trim() === ""}
              onClick={() =>
                savePrice.mutateAsync().then(() => setPriceEditorOpen(false))
              }
              className="bg-zinc-100 text-black hover:bg-zinc-300"
            >
              {savePrice.isPending ? "Saving..." : "Save price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
