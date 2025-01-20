"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "./PaymentForm";
import { useTheme } from "next-themes";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function PageContent({ clientSecret }: { clientSecret: string }) {
  const { resolvedTheme } = useTheme();
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: resolvedTheme === "dark" ? "night" : undefined },
      }}
    >
      <div className="px-6 py-12">
        <PaymentForm clientSecret={clientSecret} />
      </div>
    </Elements>
  );
}
