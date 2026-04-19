import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { CoachOnboarding } from "@/app/app/coach/CoachOnboarding";

export default async function OnboardCoachPage() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });

  if (user.onboarding.coach === "Completed") {
    const cookieStore = await cookies();
    cookieStore.set("mjolksyra-active-role", "coach", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    redirect("/app/coach/dashboard");
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
          Coach setup
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--shell-ink)]">
          Set up payments
        </h1>
        <p className="text-base text-[var(--shell-muted)]">
          Connect your Stripe account to accept athletes and receive payments.
        </p>
      </div>

      <Suspense>
        <CoachOnboarding user={user} />
      </Suspense>
    </div>
  );
}
