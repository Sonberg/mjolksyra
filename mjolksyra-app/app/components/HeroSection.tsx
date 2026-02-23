"use client";

import { isBeta } from "@/constants/isBeta";
import { RegisterDialog } from "@/dialogs/RegisterDialog";
import { SignupForm } from "./SignupForm";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="relative mx-auto grid max-w-screen-xl gap-8 px-4 pb-12 pt-20 lg:grid-cols-12 lg:pt-32">
        <div className="mr-auto place-self-center lg:col-span-7">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
            Coaching Platform
          </div>
          <h1 className="font-[var(--font-display)] mb-8 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl xl:text-6xl">
            <span className="bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-transparent">
              Transform Your Coaching <br />
              Into a Business
            </span>
          </h1>
          <p className="mb-8 max-w-2xl text-zinc-400 md:text-lg lg:text-xl">
            Start your coaching journey today. Create and sell workout
            programs with our intuitive platform. Perfect for Personal
            Trainers, Powerlifters, Crossfitters, and Weightlifters.
          </p>
          <div className="space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
            {isBeta ? (
              <SignupForm />
            ) : (
              <RegisterDialog
                trigger={
                  <button className="inline-flex items-center justify-center rounded-xl border border-zinc-500 bg-zinc-100 px-8 py-4 text-lg font-semibold text-black transition hover:bg-zinc-300">
                    Get Started Now
                  </button>
                }
              />
            )}
          </div>
        </div>
        <div className="relative hidden lg:col-span-5 lg:mt-0 lg:flex">
          <img
            src="/images/landing-page/healthy-habit.svg"
            alt="hero image"
            className="relative z-10 h-auto w-full p-6"
          />
        </div>
      </div>
    </section>
  );
}; 
