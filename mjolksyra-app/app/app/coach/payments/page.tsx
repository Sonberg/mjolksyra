import { Suspense } from "react";
import { getAuth } from "@/context/Auth";
import { getTrainees } from "@/services/trainees/getTrainees";
import { getUserMe } from "@/services/users/getUserMe";
import { CoachWorkspaceShell } from "../CoachWorkspaceShell";
import { PaymentsPageContent } from "./pageContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <CoachWorkspaceShell>
          <div className="animate-pulse rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] h-96" />
        </CoachWorkspaceShell>
      }
    >
      <PaymentsPage />
    </Suspense>
  );
}

async function PaymentsPage() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });
  const trainees =
    user.onboarding.coach === "Completed"
      ? await getTrainees({ accessToken: auth!.accessToken! })
      : [];

  return (
    <CoachWorkspaceShell>
      <PaymentsPageContent user={user} trainees={trainees} />
    </CoachWorkspaceShell>
  );
}
