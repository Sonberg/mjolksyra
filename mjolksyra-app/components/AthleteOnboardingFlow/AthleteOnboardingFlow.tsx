import { useState } from "react";
import { OnboardingCard } from "../OnboardingCard";
import { Button } from "../ui/button";
import { InvitationStep } from "./InvitationStep";
import { PaymentStep } from "./PaymentStep";
import { WelcomeStep } from "./WelcomeStep";

type Step = "welcome" | "invitations" | "payment" | "completed";

export function AthleteOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");

  const steps = {
    welcome: {
      component: <WelcomeStep onNext={() => setCurrentStep("invitations")} />,
      progress: 25,
    },
    invitations: {
      component: (
        <InvitationStep
          onNext={() => setCurrentStep("payment")}
          onBack={() => setCurrentStep("welcome")}
        />
      ),
      progress: 50,
    },
    payment: {
      component: (
        <PaymentStep
          onNext={() => setCurrentStep("completed")}
          onBack={() => setCurrentStep("invitations")}
        />
      ),
      progress: 75,
    },
    completed: {
      component: (
        <OnboardingCard
          variant="purple"
          title="You're all set! 🎉"
          text="Your account is now fully configured. You can start your fitness journey with your coach."
          button={
            <Button className="w-full font-bold" variant="default">
              Go to Dashboard
            </Button>
          }
        />
      ),
      progress: 100,
    },
  };

  return (
    <div className="mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 w-full bg-gray-200 rounded-full">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${steps[currentStep].progress}%` }}
          />
        </div>
      </div>

      {/* Current step */}
      <div className="transition-all duration-300">
        {steps[currentStep].component}
      </div>
    </div>
  );
}
