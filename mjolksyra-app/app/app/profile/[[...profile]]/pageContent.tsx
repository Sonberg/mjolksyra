"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { User, UserTrainee, UserInvitation } from "@/services/users/type";
import { useAuth } from "@/context/Auth";
import { offboardCoach } from "@/services/stripe/offboardCoach";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  NotStarted: "bg-[var(--shell-surface-strong)] text-[var(--shell-muted)]",
  Started: "bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
  Completed: "bg-[var(--shell-ink)] text-[var(--shell-surface)]",
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
      className={`inline-flex items-center rounded-none border border-[var(--shell-border)] px-2.5 py-0.5 text-xs font-medium ${statusClass[status]}`}
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
    <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-6">
      <h2 className="mb-4 text-sm font-medium text-[var(--shell-muted)]">{title}</h2>
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
        <Avatar className="size-14 rounded-none border border-[var(--shell-border)]">
          <AvatarImage src={clerkUser?.imageUrl} alt={auth.name ?? "User"} />
          <AvatarFallback className="rounded-none bg-[var(--shell-surface-strong)] text-lg text-[var(--shell-ink)]">
            {initial.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-base font-medium text-[var(--shell-ink)]">
            {auth.name ?? "—"}
          </p>
          <p className="text-sm text-[var(--shell-muted)]">{auth.email ?? "—"}</p>
        </div>
      </div>
      <div className="divide-y divide-[var(--shell-border)]/40 border-t border-[var(--shell-border)]">
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
      <span className="text-sm text-[var(--shell-muted)]">{label}</span>
      <span className="text-sm text-[var(--shell-ink)]">{value ?? "—"}</span>
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
      <div className="mb-5 -mt-1 divide-y divide-[var(--shell-border)]/40 border-t border-[var(--shell-border)]">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-[var(--shell-muted)]">Status</span>
          <StatusBadge status={user.onboarding.coach} />
        </div>
      </div>

      <p className="mb-3 text-xs text-[var(--shell-muted)]">
        Offboarding disconnects your Stripe account and cancels all active
        athlete subscriptions. This cannot be undone.
      </p>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={offboard.isPending}
            className="rounded-none"
          >
            {offboard.isPending ? "Offboarding…" : "Offboard as coach"}
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--shell-ink)]">
              Offboard as coach?
            </DialogTitle>
            <DialogDescription className="text-[var(--shell-muted)]">
              This will cancel all active athlete subscriptions and disconnect
              your Stripe account. Your athletes will be notified. You can
              re-onboard later, but existing billing history will remain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-none">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                disabled={offboard.isPending}
                className="rounded-none border border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent-hover)]"
                onClick={() => offboard.mutate()}
              >
                Yes, offboard me
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {offboard.isError && (
        <p className="mt-2 text-xs text-[var(--shell-accent)]">
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
      <span className="text-sm text-[var(--shell-ink)]">
        {displayName(coach.givenName, coach.familyName)}
      </span>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={cancel.isPending}
            className="rounded-none text-[var(--shell-muted)]"
          >
            {cancel.isPending ? "Cancelling…" : "Cancel"}
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--shell-ink)]">
              Cancel coaching relationship?
            </DialogTitle>
            <DialogDescription className="text-[var(--shell-muted)]">
              This will end your relationship with{" "}
              <span className="font-medium text-[var(--shell-ink)]">
                {displayName(coach.givenName, coach.familyName)}
              </span>{" "}
              and cancel any active subscription. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-none">Keep</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                disabled={cancel.isPending}
                className="rounded-none border border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent-hover)]"
                onClick={() => cancel.mutate()}
              >
                Yes, cancel
              </Button>
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
        <span className="text-sm text-[var(--shell-ink)]">
          {displayName(invitation.givenName, invitation.familyName)}
        </span>
        <span className="ml-2 text-xs text-[var(--shell-muted)]">
          {invitation.createdAt.toLocaleDateString()}
        </span>
      </div>
      <span className="inline-flex items-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2.5 py-0.5 text-xs font-medium text-[var(--shell-muted)]">
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
      <div className="-mt-1 divide-y divide-[var(--shell-border)]/40 border-t border-[var(--shell-border)]">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-[var(--shell-muted)]">Status</span>
          <StatusBadge status={user.onboarding.athlete} />
        </div>
      </div>

      {hasCoaches && (
        <div className="mt-4 border-t border-[var(--shell-border)] pt-4">
          <p className="mb-1 text-xs font-medium text-[var(--shell-muted)]">
            Active coaches
          </p>
          <div className="divide-y divide-[var(--shell-border)]/40">
            {user.coaches.map((coach) => (
              <CancelCoachRow key={coach.traineeId} coach={coach} />
            ))}
          </div>
        </div>
      )}

      {hasInvitations && (
        <div className="mt-4 border-t border-[var(--shell-border)] pt-4">
          <p className="mb-1 text-xs font-medium text-[var(--shell-muted)]">
            Pending invitations
          </p>
          <div className="divide-y divide-[var(--shell-border)]/40">
            {user.invitations.map((inv) => (
              <InvitationRow key={inv.id} invitation={inv} />
            ))}
          </div>
        </div>
      )}

      {!hasCoaches && !hasInvitations && (
        <p className="mt-4 border-t border-[var(--shell-border)] pt-4 text-sm text-[var(--shell-muted)]">
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:py-10">
      <PageSectionHeader
        title="Profile"
        titleClassName="text-2xl md:text-3xl"
      />
      <ProfileCard />
      {showCoachCard && <CoachCard user={user} />}
      {showAthleteCard && <AthleteCard user={user} />}
    </div>
  );
}
