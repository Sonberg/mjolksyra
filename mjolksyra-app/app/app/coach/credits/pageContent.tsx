"use client";

import { useQuery } from "@tanstack/react-query";
import { User } from "@/services/users/type";
import { getCredits } from "@/services/coaches/getCredits";
import { getCreditPricing } from "@/services/coaches/getCreditPricing";
import { getCreditLedger } from "@/services/coaches/getCreditLedger";
import { CoachOnboarding } from "../CoachOnboarding";
import { CoachWorkspaceShell } from "../CoachWorkspaceShell";
import { CoachCreditsSection } from "../CoachCreditsSection";

type Props = {
  user: User;
};

export function CreditsPageContent({ user }: Props) {
  const onboardingComplete = user.onboarding.coach === "Completed";

  const { data: credits } = useQuery({
    queryKey: ["coach-credits"],
    queryFn: getCredits,
    enabled: onboardingComplete,
  });

  const { data: creditPricing = [] } = useQuery({
    queryKey: ["coach-credit-pricing"],
    queryFn: getCreditPricing,
    enabled: onboardingComplete,
  });

  const { data: creditLedger = [] } = useQuery({
    queryKey: ["coach-credit-ledger"],
    queryFn: () => getCreditLedger({ limit: 50 }),
    enabled: onboardingComplete,
  });

  if (!onboardingComplete) {
    return (
      <CoachWorkspaceShell showTabs={false}>
        <CoachOnboarding user={user} />
      </CoachWorkspaceShell>
    );
  }

  return (
    <CoachWorkspaceShell>
      <CoachCreditsSection
        credits={credits ?? null}
        creditPricing={creditPricing}
        creditLedger={creditLedger}
      />
    </CoachWorkspaceShell>
  );
}
