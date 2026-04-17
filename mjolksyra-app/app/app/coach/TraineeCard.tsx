"use client";

import { Trainee } from "@/services/trainees/type";
import {
  CalendarClockIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  DumbbellIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ReceiptIcon,
  SparklesIcon,
  UndoIcon,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useGravatar } from "@/hooks/useGravatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";
import { chargeTrainee } from "@/services/trainees/chargeTrainee";
import { refundTraineeTransaction } from "@/services/trainees/refundTraineeTransaction";
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
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import axios from "axios";

type TraineeCardProps = {
  trainee: Trainee;
  hasUnpublishedChanges?: boolean;
};

function getMutationErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;

  const responseMessage =
    typeof error.response?.data === "string"
      ? error.response.data
      : ((error.response?.data?.error as string | undefined) ??
        (error.response?.data?.message as string | undefined));

  return responseMessage || fallback;
}

export function TraineeCard({
  trainee,
  hasUnpublishedChanges = false,
}: TraineeCardProps) {
  const router = useRouter();
  const url = useGravatar(trainee.athlete.email ?? "", 56);
  const initialPrice = useMemo(
    () => (trainee.cost?.total != null ? `${trainee.cost.total}` : ""),
    [trainee.cost?.total],
  );
  const [price, setPrice] = useState(initialPrice);
  const [billingMode, setBillingMode] = useState<"ChargeNow" | "NextCycle">(
    "ChargeNow",
  );
  const [isPriceEditorOpen, setPriceEditorOpen] = useState(false);
  const [isActionsOpen, setActionsOpen] = useState(false);
  const [isTransactionsOpen, setTransactionsOpen] = useState(false);
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
      await updateTraineeCost({ traineeId: trainee.id, amount, billingMode });
    },
    onSuccess: () => {
      if (billingMode === "ChargeNow") {
        toast.success("Price saved and charge completed. Billing cycle was reset.");
      }
    },
    onError: (error) => {
      if (billingMode === "ChargeNow") {
        toast.error(getMutationErrorMessage(error, "Price was not saved. Try again in a moment."));
      }
    },
    onSettled: () => router.refresh(),
  });
  const chargeNow = useMutation({
    mutationKey: ["trainee", trainee.id, "charge-now"],
    mutationFn: () => chargeTrainee({ traineeId: trainee.id }),
    onSuccess: () => toast.success("Charge completed. Billing cycle was reset."),
    onError: (error) => toast.error(getMutationErrorMessage(error, "Charge failed. Try again in a moment.")),
    onSettled: () => router.refresh(),
  });
  const refund = useMutation({
    mutationFn: (transactionId: string) =>
      refundTraineeTransaction({ traineeId: trainee.id, transactionId }),
    onSettled: () => router.refresh(),
  });

  const billingBadge = useMemo(() => {
    const fallbackHasPrice = (trainee.cost?.total ?? 0) > 0;
    const effectiveStatus =
      trainee.billing.status === "PriceNotSet" && fallbackHasPrice
        ? "PriceSet"
        : trainee.billing.status;

    switch (effectiveStatus) {
      case "SubscriptionActive":
        return {
          label: "Subscription active",
          hint: "Recurring billing is active.",
          className:
            "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        };
      case "AwaitingAthletePaymentMethod":
        return {
          label: "Payment method not setup",
          hint: "Athlete must complete payment setup to start billing.",
          className:
            "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        };
      case "AwaitingCoachStripeSetup":
        return {
          label: "Coach Stripe not setup",
          hint: "Complete Stripe onboarding to enable billing.",
          className:
            "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        };
      case "PriceSet":
        return {
          label: "Price set (waiting setup)",
          hint: "Price is saved. Billing starts when payment and Stripe setup are ready.",
          className:
            "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        };
      case "PriceNotSet":
      default:
        return {
          label: "Price not set",
          hint: "Set a monthly price to prepare billing.",
          className:
            "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)]",
        };
    }
  }, [trainee.billing.status, trainee.cost?.total]);

  const canChargeNow = useMemo(() => {
    const hasPrice = (trainee.cost?.total ?? 0) > 0;
    const paymentReady = trainee.billing.status === "SubscriptionActive";

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
    <article className="group overflow-hidden border border-[var(--shell-border)] bg-[var(--shell-surface)] transition-colors hover:bg-[var(--shell-surface-strong)]">
      <div className="flex flex-wrap items-start gap-4 px-5 py-5 md:px-6">
        <Avatar className="size-12 border border-[var(--shell-border)]">
          <AvatarImage src={url} alt={trainee.athlete.name} />
          <AvatarFallback className="bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]">
            {trainee.athlete.givenName?.[0] || trainee.athlete.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg text-[var(--shell-ink)] transition-colors">
              {trainee.athlete.givenName
                ? `${trainee.athlete.givenName} ${
                    trainee.athlete.familyName || ""
                  }`
                : trainee.athlete.name}
            </h3>
            {hasUnpublishedChanges ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)]">
                <span className="h-1.5 w-1.5 rounded-none bg-[var(--shell-accent)]" />
                Drafts
              </span>
            ) : null}
          </div>
          <p className="truncate text-sm text-[var(--shell-muted)]">
            {trainee.athlete.email}
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className={cn("rounded-none", billingBadge.className)}>
              {billingBadge.label}
            </Badge>
            <p className="mt-1 text-xs text-[var(--shell-muted)]">
              {billingBadge.hint}
            </p>
          </div>
        </div>
        <DropdownMenu
          modal={false}
          open={isActionsOpen}
          onOpenChange={setActionsOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-none border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)] hover:bg-[var(--shell-surface)]"
              aria-label="Open actions"
            >
              <MoreHorizontalIcon data-icon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]"
          >
            <DropdownMenuItem
              onSelect={() => {
                setActionsOpen(false);
                setBillingMode("ChargeNow");
                setPriceEditorOpen(true);
              }}
              className="cursor-pointer focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]"
            >
              <PencilIcon data-icon="inline-start" />
              Change price
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={chargeNow.isPending || !canChargeNow}
              onSelect={() => {
                setActionsOpen(false);
                chargeNow.mutate();
              }}
              className="cursor-pointer focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]"
            >
              <CreditCardIcon data-icon="inline-start" />
              {chargeNow.isPending ? "Charging..." : "Charge now (reset cycle)"}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={cancel.isPending}
              onSelect={() => {
                setActionsOpen(false);
                cancel.mutateAsync();
              }}
              className="cursor-pointer focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]"
            >
              <XIcon data-icon="inline-start" />
              {cancel.isPending ? "Cancelling..." : "Cancel relationship"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-3 border-y border-[var(--shell-border)] bg-[var(--shell-surface)] px-5 py-4 md:grid-cols-4 md:px-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-[var(--shell-surface-strong)] px-3 py-3 text-center"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--shell-muted)]">
              {metric.label}
            </p>
            <p className="mt-2 text-base font-semibold text-[var(--shell-ink)]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {trainee.transactions.length > 0 && (
        <Collapsible
          open={isTransactionsOpen}
          onOpenChange={setTransactionsOpen}
          className="border-b border-[var(--shell-border)] bg-[var(--shell-surface)]"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface-strong)] md:px-6">
            <span className="flex items-center gap-2">
              <ReceiptIcon className="size-3.5" />
              Transactions ({trainee.transactions.length})
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform",
                isTransactionsOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="divide-y divide-[var(--shell-border)] px-5 pb-3 md:px-6">
              {trainee.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "shrink-0 rounded-none",
                        tx.status === "Failed" && "text-[var(--shell-muted)]",
                        tx.status === "Refunded" && "text-[var(--shell-muted)]",
                      )}
                    >
                      {tx.status}
                    </Badge>
                    <span className="text-sm text-[var(--shell-ink)]">
                      {tx.amount} {tx.currency.toUpperCase()}
                    </span>
                    <span className="truncate text-xs text-[var(--shell-muted)]">
                      {format(new Date(tx.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  {tx.status === "Succeeded" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={refund.isPending}
                      onClick={() => refund.mutate(tx.id)}
                      className="shrink-0 rounded-none"
                    >
                      <UndoIcon data-icon="inline-start" />
                      Refund
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="flex flex-wrap gap-3 bg-[var(--shell-surface)] px-5 py-4 md:px-6">
        <Button
          className="rounded-none border border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent-hover)]"
          onClick={() => router.push(`/app/coach/athletes/${trainee.id}/planner`)}
        >
          <ClipboardCheckIcon data-icon="inline-start" />
          Planner
        </Button>
        <Button
          variant="outline"
          className="rounded-none border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)] hover:bg-[var(--shell-surface)]"
          onClick={() => router.push(`/app/coach/athletes/${trainee.id}/workouts`)}
        >
          <ClipboardCheckIcon data-icon="inline-start" />
          Workouts
        </Button>
        <Button
          variant="outline"
          className="rounded-none border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)] hover:bg-[var(--shell-surface)]"
          onClick={() => router.push(`/app/coach/athletes/${trainee.id}/insights`)}
        >
          <SparklesIcon data-icon="inline-start" />
          Insights
        </Button>
      </div>

      <Dialog open={isPriceEditorOpen} onOpenChange={setPriceEditorOpen}>
        <DialogContent className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change price</DialogTitle>
            <DialogDescription className="text-[var(--shell-muted)]">
              Set the monthly coaching price charged to the athlete.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <label
              htmlFor={`trainee-price-dialog-${trainee.id}`}
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]"
            >
              Monthly price (kr)
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`trainee-price-dialog-${trainee.id}`}
                inputMode="numeric"
                pattern="[0-9]*"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="1000"
                className="w-full rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--shell-ink)] outline-none transition placeholder:text-[var(--shell-muted)] focus:border-[var(--shell-accent)]"
              />
              <span className="text-sm text-[var(--shell-muted)]">kr/mo</span>
            </div>
            <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--shell-muted)]">
                Apply method
              </p>
              <p className="mt-1 text-sm text-[var(--shell-ink)]">
                Choose when the new price should take effect.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setBillingMode("ChargeNow")}
                className={cn(
                  "w-full rounded-none border px-3 py-3 text-left transition",
                  billingMode === "ChargeNow"
                    ? "border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]"
                    : "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)] hover:bg-[var(--shell-surface)]",
                )}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 rounded-none border p-1.5",
                      billingMode === "ChargeNow"
                        ? "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]"
                        : "border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-muted)]",
                    )}
                  >
                    <CreditCardIcon className="size-3.5" />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      Charge now
                      {billingMode === "ChargeNow" ? (
                        <CheckCircle2Icon className="size-4 text-[var(--shell-accent)]" />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--shell-muted)]">
                      Charge immediately and reset the monthly billing cycle.
                    </span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBillingMode("NextCycle")}
                className={cn(
                  "w-full rounded-none border px-3 py-3 text-left transition",
                  billingMode === "NextCycle"
                    ? "border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]"
                    : "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)] hover:bg-[var(--shell-surface)]",
                )}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 rounded-none border p-1.5",
                      billingMode === "NextCycle"
                        ? "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]"
                        : "border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-muted)]",
                    )}
                  >
                    <CalendarClockIcon className="size-3.5" />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      Next cycle
                      {billingMode === "NextCycle" ? (
                        <CheckCircle2Icon className="size-4 text-[var(--shell-accent)]" />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--shell-muted)]">
                      Save now and apply this price on the next scheduled
                      charge.
                    </span>
                  </span>
                </span>
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPriceEditorOpen(false)}
              className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)] hover:bg-[var(--shell-surface)]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={savePrice.isPending || price.trim() === ""}
              onClick={() =>
                savePrice.mutateAsync().then(() => setPriceEditorOpen(false))
              }
              className="rounded-none border border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent-hover)]"
            >
              {savePrice.isPending
                ? "Saving..."
                : billingMode === "ChargeNow"
                  ? "Save & charge now"
                  : "Save for next cycle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
