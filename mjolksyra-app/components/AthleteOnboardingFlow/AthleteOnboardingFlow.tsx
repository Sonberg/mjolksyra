import { useEffect, useMemo, useState } from "react";

import { PaymentStep } from "./PaymentStep";
import { WelcomeStep } from "./WelcomeStep";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import { Elements } from "@stripe/react-stripe-js";
import { Spinner } from "../Spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserEvents } from "@/context/UserEvents";

type Step = "welcome" | "payment";

type Props = {
  hasCoachContext?: boolean;
};

export function AthleteOnboardingFlow({ hasCoachContext = false }: Props) {
  const userEvents = useUserEvents();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [isSyncingReturn, setIsSyncingReturn] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

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

  useEffect(() => {
    const redirectStatus = searchParams.get("redirect_status");
    const setupIntentId = searchParams.get("setup_intent");

    if (redirectStatus !== "succeeded" || !setupIntentId) {
      return;
    }

    let cancelled = false;
    setCurrentStep("payment");
    setIsSyncingReturn(true);
    setReturnError(null);

    (async () => {
      try {
        const response = await fetch("/api/stripe/setup-intent/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setupIntentId }),
        });

        if (!response.ok) {
          throw new Error("Failed to sync payment status");
        }

        if (cancelled) return;

        const url = new URL(window.location.href);
        url.searchParams.delete("redirect_status");
        url.searchParams.delete("setup_intent");
        url.searchParams.delete("setup_intent_client_secret");
        router.replace(`${url.pathname}${url.search ? url.search : ""}`);
        router.refresh();
      } catch (error) {
        if (cancelled) return;
        setReturnError(
          error instanceof Error ? error.message : "Failed to sync payment status",
        );
      } finally {
        if (!cancelled) {
          setIsSyncingReturn(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  useEffect(() => {
    const onUserUpdated = () => {
      router.refresh();
    };
    const unsubscribe = userEvents.subscribe("user.updated", onUserUpdated);

    return () => {
      unsubscribe();
    };
  }, [router, userEvents]);

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
          key={clientSecret}
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
      {isSyncingReturn ? (
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
          Finalizing your payment method setup...
        </div>
      ) : null}
      {returnError ? (
        <div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {returnError}
        </div>
      ) : null}
      <div className="transition-all duration-300">
        {steps[currentStep].component}
      </div>
    </div>
  );
}
