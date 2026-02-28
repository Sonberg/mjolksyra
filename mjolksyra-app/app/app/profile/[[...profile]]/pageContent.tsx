"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { User, UserTrainee, UserInvitation } from "@/services/users/type";
import { useAuth } from "@/context/Auth";
import { offboardCoach } from "@/services/stripe/offboardCoach";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type OnboardingStatus = "NotStarted" | "Started" | "Completed";

const statusLabel: Record<OnboardingStatus, string> = {
  NotStarted: "Not started",
  Started: "In progress",
  Completed: "Completed",
};

const statusClass: Record<OnboardingStatus, string> = {
  NotStarted: "bg-zinc-800 text-zinc-400",
  Started: "bg-yellow-900/50 text-yellow-300",
  Completed: "bg-green-900/50 text-green-300",
};

function displayName(
  givenName: string | null,
  familyName: string | null,
): string {
  return [givenName, familyName].filter(Boolean).join(" ") || "Unknown";
}

function StatusBadge({ status }: { status: OnboardingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="mb-4 text-sm font-medium text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}

// ─── Account card ────────────────────────────────────────────────────────────

function ProfileCard() {
  const auth = useAuth();
  const { user: clerkUser } = useUser();
  const initial = (auth.givenName?.[0] ?? "") + (auth.familyName?.[0] ?? "");

  return (
    <SectionCard title="Account">
      <div className="flex items-center gap-4 pb-5">
        <Avatar className="h-14 w-14 border border-zinc-700">
          <AvatarImage src={clerkUser?.imageUrl} alt={auth.name ?? "User"} />
          <AvatarFallback className="bg-zinc-900 text-lg text-zinc-200">
            {initial.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-base font-medium text-zinc-100">
            {auth.name ?? "—"}
          </p>
          <p className="text-sm text-zinc-400">{auth.email ?? "—"}</p>
        </div>
      </div>
      <div className="divide-y divide-zinc-800 border-t border-zinc-800">
        <Row label="First name" value={auth.givenName} />
        <Row label="Last name" value={auth.familyName} />
        <Row label="Email" value={auth.email} />
      </div>
    </SectionCard>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-100">{value ?? "—"}</span>
    </div>
  );
}

// ─── Coach card ───────────────────────────────────────────────────────────────

function CoachCard({ user }: { user: User }) {
  const router = useRouter();

  const offboard = useMutation({
    mutationKey: ["coach", "offboard"],
    mutationFn: offboardCoach,
    onSettled: () => router.refresh(),
  });

  return (
    <SectionCard title="Coach">
      <div className="divide-y divide-zinc-800 border-t border-zinc-800 -mt-1 mb-5">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-zinc-400">Status</span>
          <StatusBadge status={user.onboarding.coach} />
        </div>
      </div>

      <p className="mb-3 text-xs text-zinc-500">
        Offboarding disconnects your Stripe account and cancels all active
        athlete subscriptions. This cannot be undone.
      </p>

      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            disabled={offboard.isPending}
            className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-1.5 text-sm font-medium text-red-400 transition hover:border-red-700 hover:bg-red-900/40 hover:text-red-300 disabled:opacity-50"
          >
            {offboard.isPending ? "Offboarding…" : "Offboard as coach"}
          </button>
        </DialogTrigger>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              Offboard as coach?
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will cancel all active athlete subscriptions and disconnect
              your Stripe account. Your athletes will be notified. You can
              re-onboard later, but existing billing history will remain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
              >
                Cancel
              </button>
            </DialogClose>
            <DialogClose asChild>
              <button
                type="button"
                disabled={offboard.isPending}
                className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                onClick={() => offboard.mutate()}
              >
                Yes, offboard me
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {offboard.isError && (
        <p className="mt-2 text-xs text-red-400">
          Something went wrong. Please try again.
        </p>
      )}
    </SectionCard>
  );
}

// ─── Athlete card ─────────────────────────────────────────────────────────────

function CancelCoachRow({ coach }: { coach: UserTrainee }) {
  const router = useRouter();

  const cancel = useMutation({
    mutationKey: ["trainee", coach.traineeId, "cancel"],
    mutationFn: () => cancelTrainee({ traineeId: coach.traineeId }),
    onSettled: () => router.refresh(),
  });

  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-zinc-100">
        {displayName(coach.givenName, coach.familyName)}
      </span>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            disabled={cancel.isPending}
            className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200 disabled:opacity-50"
          >
            {cancel.isPending ? "Cancelling…" : "Cancel"}
          </button>
        </DialogTrigger>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              Cancel coaching relationship?
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will end your relationship with{" "}
              <span className="font-medium text-zinc-200">
                {displayName(coach.givenName, coach.familyName)}
              </span>{" "}
              and cancel any active subscription. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
              >
                Keep
              </button>
            </DialogClose>
            <DialogClose asChild>
              <button
                type="button"
                disabled={cancel.isPending}
                className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                onClick={() => cancel.mutate()}
              >
                Yes, cancel
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvitationRow({ invitation }: { invitation: UserInvitation }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-sm text-zinc-100">
          {displayName(invitation.givenName, invitation.familyName)}
        </span>
        <span className="ml-2 text-xs text-zinc-500">
          {invitation.createdAt.toLocaleDateString()}
        </span>
      </div>
      <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
        Pending
      </span>
    </div>
  );
}

function AthleteCard({ user }: { user: User }) {
  const hasCoaches = user.coaches.length > 0;
  const hasInvitations = user.invitations.length > 0;

  return (
    <SectionCard title="Athlete">
      <div className="divide-y divide-zinc-800 border-t border-zinc-800 -mt-1">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-zinc-400">Status</span>
          <StatusBadge status={user.onboarding.athlete} />
        </div>
      </div>

      {hasCoaches && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <p className="mb-1 text-xs font-medium text-zinc-500">
            Active coaches
          </p>
          <div className="divide-y divide-zinc-800">
            {user.coaches.map((coach) => (
              <CancelCoachRow key={coach.traineeId} coach={coach} />
            ))}
          </div>
        </div>
      )}

      {hasInvitations && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <p className="mb-1 text-xs font-medium text-zinc-500">
            Pending invitations
          </p>
          <div className="divide-y divide-zinc-800">
            {user.invitations.map((inv) => (
              <InvitationRow key={inv.id} invitation={inv} />
            ))}
          </div>
        </div>
      )}

      {!hasCoaches && !hasInvitations && (
        <p className="mt-4 border-t border-zinc-800 pt-4 text-sm text-zinc-500">
          No active coaches.
        </p>
      )}
    </SectionCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = {
  user: User;
};

export function ProfilePageContent({ user }: Props) {
  const showCoachCard = user.onboarding.coach !== "NotStarted";
  const showAthleteCard =
    user.onboarding.athlete !== "NotStarted" ||
    user.coaches.length > 0 ||
    user.invitations.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:py-10">
      <h1 className="text-2xl font-semibold text-zinc-100">Profile</h1>
      <ProfileCard />
      {showCoachCard && <CoachCard user={user} />}
      {showAthleteCard && <AthleteCard user={user} />}
    </div>
  );
}
