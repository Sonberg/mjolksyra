import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";

export default async function OnboardAthletePage() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });

  if (user.onboarding.athlete === "Completed") {
    const cookieStore = await cookies();
    cookieStore.set("mjolksyra-active-role", "athlete", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    redirect("/app/athlete");
  }

  const isPaymentSetupComplete = false;
  const hasCoachContext = user.coaches.length > 0;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
          Athlete setup
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--shell-ink)]">
          Set up payments
        </h1>
        <p className="text-base text-[var(--shell-muted)]">
          Add a payment method so your coach can charge you when your training starts.
        </p>
      </div>

      <Suspense>
        <AthleteOnboardingFlow
          hasCoachContext={hasCoachContext}
          isPaymentSetupComplete={isPaymentSetupComplete}
        />
      </Suspense>
    </div>
  );
}
