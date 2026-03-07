"use client";

import { isBeta } from "@/constants/isBeta";
import { RegisterDialog } from "@/dialogs/RegisterDialog";
import { SignupForm } from "./SignupForm";
import { HeroIllustration } from "./HeroIllustration";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-none bg-[var(--home-accent)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-none bg-[var(--home-border)]/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-screen-xl gap-8 px-4 pb-12 pt-20 lg:grid-cols-12 lg:pt-32">
        <div className="mr-auto place-self-center lg:col-span-7">
          <div className="mb-6 inline-flex items-center rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--home-muted)]">
            Coaching Platform
          </div>
          <h1 className="font-[var(--font-display)] mb-8 max-w-2xl text-4xl leading-tight tracking-tight md:text-5xl xl:text-6xl">
            <span className="text-[var(--home-text)]">
              Build and manage strength training programs for your clients
            </span>
          </h1>
          <p className="mb-8 max-w-2xl text-[var(--home-muted)] md:text-lg lg:text-xl">
            Plan workouts, track progression, and give feedback in one place.
            Built for coaches in strength training, powerlifting, and functional
            fitness.
          </p>
          <div className="mb-8 inline-flex items-center rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] px-4 py-2 text-sm font-medium text-[var(--home-text)]">
            14-day free trial. Cancel anytime.
          </div>
          <div className="space-y-3 sm:flex sm:space-x-3 sm:space-y-0">
            {isBeta ? (
              <SignupForm />
            ) : (
              <>
                <RegisterDialog
                  trigger={
                    <button className="inline-flex items-center justify-center rounded-none border-2 border-[var(--home-border)] bg-[var(--home-accent)] px-8 py-4 text-lg font-semibold text-[var(--home-accent-ink)] transition hover:bg-[#ce2f10]">
                      Start free trial
                    </button>
                  }
                />
                <a
                  href="#planner-demo"
                  className="inline-flex items-center justify-center rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] px-8 py-4 text-lg font-semibold text-[var(--home-text)] transition hover:bg-[var(--home-surface-strong)]"
                >
                  Try live demo
                </a>
              </>
            )}
          </div>
        </div>
        <div className="relative hidden lg:col-span-5 lg:mt-0 lg:flex">
          <div className="relative z-10 h-auto w-full p-6">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
};
