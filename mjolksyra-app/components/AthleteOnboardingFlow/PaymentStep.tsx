import { useState } from "react";
import { OnboardingCard } from "../OnboardingCard";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "../ui/button";

interface PaymentStepProps {
  onBack: () => void;
  clientSecret: string;
}

export function PaymentStep({ onBack, clientSecret }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setReady] = useState(false);

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
    await elements.submit();
    const { error } = await stripe.confirmSetup({
      clientSecret,
      elements,
      confirmParams: {
        return_url: window.location.href,
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
    <div className="space-y-6">
      <OnboardingCard
        title="Add Payment Method"
        text="To complete your registration, please add a payment method. You won't be charged until your coach confirms the subscription."
      />

      <div className="p-8 bg-slate-500/20 rounded-xl space-y-4">
        <form onSubmit={handleSubmit}>
          <PaymentElement
            onReady={() => setReady(true)}
            options={{
              layout: {
                type: "tabs",
                radios: true,
                spacedAccordionItems: true,
              },
            }}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
      {isReady && (
        <div className="flex justify-between mb-16">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isLoading} className="font-bold">
            Complete Setup
          </Button>
        </div>
      )}
    </div>
  );
}
