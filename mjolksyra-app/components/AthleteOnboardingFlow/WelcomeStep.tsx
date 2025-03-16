import { OnboardingCard } from "../OnboardingCard";
import { Button } from "../ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <OnboardingCard
      variant="default"
      title="Welcome to Your Fitness Journey!"
      text="We're excited to have you here. Let's get your account set up so you can start working with your coach and achieve your fitness goals."
      button={
        <Button onClick={onNext} className="w-full font-bold">
          Get Started
        </Button>
      }
    />
  );
} 