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
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setIsLoading(false);
      return;
    }

    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
      setError("Payment form is not loaded.");
      setIsLoading(false);
      return;
    }
    const submitResult = await elements.submit();
    if (submitResult.error) {
      setError(submitResult.error.message || "Please review your payment details.");
      setIsLoading(false);
      return;
    }

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
      setIsComplete(true);
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <OnboardingCard
        title="Add Payment Method"
        text="To complete your registration, please add a payment method. You won't be charged until your coach confirms the subscription."
      />

      <div className="rounded-xl bg-slate-500/20 p-8">
        <form onSubmit={handleSubmit}>
          <PaymentElement
            onReady={() => setReady(true)}
            options={{
              layout: {
                type: "tabs",
              },
            }}
          />
          {error ? (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          ) : null}
          {isComplete ? (
            <p className="mt-4 text-sm text-emerald-400">
              Payment method submitted. You can close this step after redirect/confirmation.
            </p>
          ) : null}

          {isReady ? (
            <div className="mb-16 mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading} className="font-bold">
                {isLoading ? "Saving..." : "Complete Setup"}
              </Button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
