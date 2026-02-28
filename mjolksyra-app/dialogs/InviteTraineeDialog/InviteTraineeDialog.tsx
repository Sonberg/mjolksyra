import { ReactNode, useState } from "react";
import { z } from "zod";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useValidation } from "@/hooks/useValidation";
import { inviteTrainee } from "@/services/traineeInvitations/inviteTrainee";

const schema = z.object({
  email: z.string().email(),
  monthlyPriceAmount: z
    .string()
    .trim()
    .min(1, "Required")
    .refine((v) => /^\d+$/.test(v), "Must be a whole number")
    .refine((v) => Number.parseInt(v, 10) > 0, "Must be greater than zero"),
});

type Props = {
  trigger: ReactNode;
  onCompletion: () => Promise<void> | void;
};

export function InviteTraineeDialog({ trigger, onCompletion }: Props) {
  const [email, setEmail] = useState("");
  const [monthlyPriceAmount, setMonthlyPriceAmount] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = useValidation({ schema, values: { email, monthlyPriceAmount } });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setOpen(open);
        if (open) {
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite trainee</DialogTitle>
          <DialogDescription>
            How would you like to coach? We will send a invitation link with
            email
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center gap-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
                setError(null);
              }}
              className="col-span-3"
              onBlur={(ev) => {
                validation.showError(ev.target.id);
              }}
            />
          </div>
          <div className="grid items-center gap-4">
            <Label htmlFor="monthlyPriceAmount">Monthly price (kr)</Label>
            <Input
              id="monthlyPriceAmount"
              value={monthlyPriceAmount}
              onChange={(ev) => {
                setMonthlyPriceAmount(ev.target.value.replace(/[^\d]/g, ""));
                setError(null);
              }}
              className="col-span-3"
              placeholder="Optional, e.g. 1000"
              onBlur={(ev) => {
                validation.showError(ev.target.id);
              }}
            />
          </div>
          {error ? (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              if (!validation.success) {
                validation.showAllError();
                return;
              }

              setError(null);
              setIsSubmitting(true);
              try {
                await inviteTrainee({
                  email,
                  monthlyPriceAmount: Number.parseInt(monthlyPriceAmount, 10),
                });
                await onCompletion();
                setOpen(false);
                setEmail("");
                setMonthlyPriceAmount("");
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Unable to send invitation.",
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
