import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";

import { ReactNode, useState } from "react";
import { AtheletePaymentDialogContent } from "./AtheletePaymentDialogContent";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Props = {
  trigger: ReactNode;
};

export function AtheletePaymentDialog({ trigger }: Props) {
  const [isOpen, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const { data } = useQuery({
    queryKey: ["stripe", "setup-intent"],
    queryFn: async () => {
      const response = await fetch(`/api/stripe/setup-intent`, {
        method: "POST",
      });
      const { clientSecret } = await response.json();

      return clientSecret;
    },
    enabled: isOpen,
  });

  console.log(data);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[40rem]">
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>

        {data ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: data,
              appearance: {
                theme: resolvedTheme === "dark" ? "night" : undefined,
              },
            }}
          >
            <AtheletePaymentDialogContent clientSecret={data} />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
