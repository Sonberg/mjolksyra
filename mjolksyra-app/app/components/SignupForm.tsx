"use client";

import { RegisterDialog } from "@/dialogs/RegisterDialog";

export const SignupForm = () => {
  return (
    <div className="w-full flex flex-col items-start gap-4">
      <div className="text-sm text-[var(--home-muted)]">
        Join the waitlist to get early access.
      </div>
      <RegisterDialog
        trigger={
          <button className="inline-flex items-center justify-center rounded-none border-2 border-[var(--home-border)] bg-[var(--home-accent)] px-6 py-3 font-semibold text-[var(--home-accent-ink)] transition hover:bg-[#ce2f10]">
            Join Waitlist
          </button>
        }
      />
    </div>
  );
};
