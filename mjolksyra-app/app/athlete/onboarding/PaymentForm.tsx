"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";

export function PaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setIsLoading(false);
      return;
    }

    const cardElement = elements.getElement(PaymentElement);
    if (!cardElement) {
      setError("Card Element is not loaded.");
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmSetup({
      clientSecret,
      elements,
      confirmParams: {
        return_url: "",
      },
    });

    if (error) {
      setError(error.message || "An unexpected error occurred.");
    } else {
      console.log("Setup Intent successful");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: "accordion" }} />
      <button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#6772E5",
          color: "#FFF",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {isLoading ? "Saving..." : "Save Payment Method"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
