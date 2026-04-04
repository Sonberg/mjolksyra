import { Suspense } from "react";
import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { CoachWorkspaceShell } from "../CoachWorkspaceShell";
import { CreditsPageContent } from "./pageContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <CoachWorkspaceShell>
          <div className="animate-pulse rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] h-96" />
        </CoachWorkspaceShell>
      }
    >
      <CreditsPage />
    </Suspense>
  );
}

async function CreditsPage() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });

  return <CreditsPageContent user={user} />;
}
