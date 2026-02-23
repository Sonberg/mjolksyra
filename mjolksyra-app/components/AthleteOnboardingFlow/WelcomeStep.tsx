import { OnboardingCard } from "../OnboardingCard";
import { Button } from "../ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-4">
      <OnboardingCard
        variant="default"
        title="Your coach will send an invite"
        text="Your coach will invite you by email to connect. Once accepted, you can set up payment and access your training plan here."
      />
      <OnboardingCard
        variant="default"
        title="Prepare in advance"
        text="You can already prepare by setting up your payment method, so everything is ready when your coach invitation is accepted."
        className="p-6"
        button={
          <Button onClick={onNext} className="w-full font-bold">
            Get Started
          </Button>
        }
      />
    </div>
  );
}
