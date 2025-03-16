import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";

import { useMemo } from "react";
import { AtheletePaymentDialogContent } from "./AtheletePaymentDialogContent";
import { Spinner } from "@/components/Spinner";

type Props = {
  onBack: () => void;
};

export function AtheletePaymentDialog({ onBack }: Props) {
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
  });

  const stripe = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
    []
  );

  return data ? (
    <Elements
      stripe={stripe}
      options={{
        clientSecret: data,
        appearance: {
          theme: resolvedTheme === "dark" ? "night" : undefined,
        },
      }}
    >
      <AtheletePaymentDialogContent clientSecret={data} onBack={onBack} />
    </Elements>
  ) : (
    <div className="flex items-center justify-center min-h-56">
      <Spinner className="stroke-slate-400" size={32} />
    </div>
  );
}
