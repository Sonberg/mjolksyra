import { Button } from "@/components/ui/button";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";

type Props = {
  clientSecret: string;
  onBack: () => void;
};

export function AtheletePaymentDialogContent({ clientSecret, onBack }: Props) {
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
      {isReady && (
        <div className="flex justify-between pt-8">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !elements || !stripe}
            className="font-bold"
          >
            Complete Setup
          </Button>
        </div>
      )}
    </form>
  );
}
