"use client";

import { RegisterDialog } from "@/dialogs/RegisterDialog";

export const CTASection = () => {
  return (
    <section className="bg-[var(--home-surface)]/70 py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4 text-center">
        <div className="mx-auto max-w-3xl rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] px-6 py-12 md:px-10">
          <h2 className="font-[var(--font-display)] mb-6 text-3xl text-[var(--home-text)] md:text-4xl">
          Ready to start your coaching journey?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--home-muted)]">
            Create your coach account, connect Stripe, and start inviting
            athletes to your training workspace.
          </p>
          <RegisterDialog
            trigger={
              <button className="inline-flex items-center justify-center rounded-none border-2 border-[var(--home-border)] bg-[var(--home-accent)] px-8 py-4 text-lg font-semibold text-[var(--home-accent-ink)] transition hover:bg-[#ce2f10]">
                Get Started Now
              </button>
            }
          />
        </div>
      </div>
    </section>
  );
};
