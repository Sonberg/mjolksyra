import { OnboardingCard } from "../OnboardingCard";
import { Button } from "../ui/button";

interface WelcomeStepProps {
  onNext: () => void;
  hasCoachContext?: boolean;
}

export function WelcomeStep({ onNext, hasCoachContext = false }: WelcomeStepProps) {
  return (
    <div className="space-y-4">
      {!hasCoachContext && (
        <OnboardingCard
          variant="default"
          title="Your coach will send an invite"
          text="Your coach will invite you by email to connect. Once accepted, you can set up payment and access your training plan here."
        />
      )}
      <OnboardingCard
        variant="default"
        title={hasCoachContext ? "Complete payment setup now" : "Prepare in advance"}
        text={
          hasCoachContext
            ? "Your coach is waiting on you. Set up your payment method now so your training can start as soon as the invitation is approved."
            : "You can already prepare by setting up your payment method, so everything is ready when your coach invitation is accepted."
        }
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
