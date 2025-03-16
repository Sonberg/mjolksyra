import { OnboardingCard } from "../OnboardingCard";
import { AtheletePaymentDialog } from "@/dialogs/AtheletePaymentDialog";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  return (
    <div className="space-y-6">
      <OnboardingCard
        title="Add Payment Method"
        text="To complete your registration, please add a payment method. You won't be charged until your coach confirms the subscription."
      />

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <AtheletePaymentDialog onBack={onBack} />
      </div>
    </div>
  );
}
