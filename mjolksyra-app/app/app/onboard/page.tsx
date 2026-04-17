import Link from "next/link";
import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function OnboardPage() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });

  const coachDone = user.onboarding.coach === "Completed";
  const athleteDone = user.onboarding.athlete === "Completed";

  // Both done — should not be here
  if (coachDone && athleteDone) {
    redirect("/app/coach/dashboard");
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
          Get started
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--shell-ink)]">
          {coachDone || athleteDone ? "Add another role" : "Choose your role"}
        </h1>
        <p className="text-base text-[var(--shell-muted)]">
          {coachDone || athleteDone
            ? "You can expand your access by setting up an additional role."
            : "Select how you want to use Mjolksyra. You can add the other role later."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!coachDone && (
          <Link href="/app/onboard/coach" className="group block">
            <div className="h-full flex flex-col gap-4 border border-[var(--shell-border)] bg-[var(--shell-surface)] p-8 transition-colors hover:bg-[var(--shell-surface-strong)]">
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                  Role
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--shell-ink)]">
                  Coach
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-[var(--shell-muted)]">
                Manage athletes, build workout programs, and receive payments for your coaching services.
              </p>
              <div className="pt-2">
                <Button
                  variant="default"
                  className="pointer-events-none rounded-none"
                >
                  Set up as coach
                </Button>
              </div>
            </div>
          </Link>
        )}

        {!athleteDone && (
          <Link href="/app/onboard/athlete" className="group block">
            <div className="h-full flex flex-col gap-4 border border-[var(--shell-border)] bg-[var(--shell-surface)] p-8 transition-colors hover:bg-[var(--shell-surface-strong)]">
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                  Role
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--shell-ink)]">
                  Athlete
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-[var(--shell-muted)]">
                Train with a coach, follow structured programs, and track your workouts in one place.
              </p>
              <div className="pt-2">
                <Button
                  variant="default"
                  className="pointer-events-none rounded-none"
                >
                  Set up as athlete
                </Button>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
