"use client";

"use client";

import { useEffect } from "react";
import { AthleteOnboardingFlow } from "./AthleteOnboardingFlow";

function withUrlParams(params: Record<string, string>, children: React.ReactNode) {
  return function UrlParamWrapper() {
    useEffect(() => {
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      window.history.replaceState(null, "", url.toString());
      return () => {
        const clean = new URL(window.location.href);
        Object.keys(params).forEach((k) => clean.searchParams.delete(k));
        window.history.replaceState(null, "", clean.toString());
      };
    }, []);
    return <>{children}</>;
  };
}

function SyncingReturnFixture() {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("setup_intent", "si_test");
    url.searchParams.set("redirect_status", "succeeded");
    window.history.replaceState(null, "", url.toString());

    const original = globalThis.fetch;
    globalThis.fetch = () => new Promise(() => {});

    return () => {
      globalThis.fetch = original;
      const clean = new URL(window.location.href);
      clean.searchParams.delete("setup_intent");
      clean.searchParams.delete("redirect_status");
      window.history.replaceState(null, "", clean.toString());
    };
  }, []);

  return <AthleteOnboardingFlow hasCoachContext={false} isPaymentSetupComplete={false} />;
}

function ReturnErrorFixture() {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("setup_intent", "si_test");
    url.searchParams.set("redirect_status", "succeeded");
    window.history.replaceState(null, "", url.toString());

    const original = globalThis.fetch;
    globalThis.fetch = () => Promise.reject(new Error("Failed to sync payment status"));

    return () => {
      globalThis.fetch = original;
      const clean = new URL(window.location.href);
      clean.searchParams.delete("setup_intent");
      clean.searchParams.delete("redirect_status");
      window.history.replaceState(null, "", clean.toString());
    };
  }, []);

  return <AthleteOnboardingFlow hasCoachContext={false} isPaymentSetupComplete={false} />;
}

export default {
  Default: () => (
    <AthleteOnboardingFlow hasCoachContext={false} isPaymentSetupComplete={false} />
  ),

  WithCoachContext: () => (
    <AthleteOnboardingFlow hasCoachContext={true} isPaymentSetupComplete={false} />
  ),

  SyncingReturn: () => <SyncingReturnFixture />,

  ReturnError: () => <ReturnErrorFixture />,
};
