import { useState } from "react";
import { OnboardingCard } from "../OnboardingCard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add payment processing logic here
    onNext();
  };

  return (
    <div className="space-y-6">
      <OnboardingCard
        title="Add Payment Method"
        text="To complete your registration, please add a payment method. You won't be charged until your coach confirms the subscription."
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Card Number</label>
          <Input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.number}
            onChange={(e) =>
              setCardDetails({ ...cardDetails, number: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Expiry Date</label>
            <Input
              type="text"
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, expiry: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CVC</label>
            <Input
              type="text"
              placeholder="123"
              value={cardDetails.cvc}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, cvc: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="font-bold">
            Complete Setup
          </Button>
        </div>
      </form>
    </div>
  );
} 