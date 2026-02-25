"use client";

import { RegisterDialog } from "@/dialogs/RegisterDialog";

export const SignupForm = () => {
  return (
    <div className="w-full flex flex-col items-start gap-4">
      <div className="text-sm text-zinc-400">
        Join the waitlist to get early access.
      </div>
      <RegisterDialog
        trigger={
          <button className="inline-flex items-center justify-center rounded-xl border border-zinc-500 bg-zinc-100 px-6 py-3 font-semibold text-black transition hover:bg-zinc-300">
            Join Waitlist
          </button>
        }
      />
    </div>
  );
};
