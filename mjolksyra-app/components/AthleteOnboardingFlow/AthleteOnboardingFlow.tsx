import { useMemo, useState } from "react";

import { PaymentStep } from "./PaymentStep";
import { WelcomeStep } from "./WelcomeStep";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import { Elements } from "@stripe/react-stripe-js";
import { Spinner } from "../Spinner";

type Step = "welcome" | "payment";

type Props = {
  hasCoachContext?: boolean;
};

export function AthleteOnboardingFlow({ hasCoachContext = false }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");

  const { data: clientSecret } = useQuery({
    queryKey: ["stripe", "setup-intent"],
    queryFn: async () => {
      const response = await fetch(`/api/stripe/setup-intent`, {
        method: "POST",
      });
      const { clientSecret } = await response.json();

      return `${clientSecret}`;
    },
  });

  const stripe = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
    []
  );

  const steps = {
    welcome: {
      component: (
        <WelcomeStep
          onNext={() => setCurrentStep("payment")}
          hasCoachContext={hasCoachContext}
        />
      ),
    },
    payment: {
      component: clientSecret ? (
        <Elements
          stripe={stripe}
          options={{
            clientSecret: clientSecret,
            appearance: {
              theme: "night",
            },
          }}
        >
          <PaymentStep
            clientSecret={clientSecret!}
            onBack={() => setCurrentStep("welcome")}
          />
        </Elements>
      ) : (
        <div className="flex items-center justify-center min-h-56">
          <Spinner className="stroke-slate-400" size={32} />
        </div>
      ),
    },
  };

  return (
    <div className="mx-auto bg-background">
      <div className="transition-all duration-300">
        {steps[currentStep].component}
      </div>
    </div>
  );
}
