"use client";

import { isBeta } from "@/constants/isBeta";
import { RegisterDialog } from "@/dialogs/RegisterDialog";
import { SignupForm } from "./SignupForm";

export const HeroSection = () => {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm"></div>
      <div className="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-44 relative">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-8 text-4xl leading-relaxed font-extrabold tracking-tight md:text-5xl xl:text-6xl">
            <span className="bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
              Transform Your Coaching <br />
              Into a Business
            </span>
          </h1>
          <p className="max-w-2xl mb-6 text-gray-400 lg:mb-8 md:text-lg lg:text-xl">
            Start your coaching journey today. Create and sell workout
            programs with our intuitive platform. Perfect for Personal
            Trainers, Powerlifters, Crossfitters, and Weightlifters.
          </p>
          <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
            {isBeta ? (
              <SignupForm />
            ) : (
              <RegisterDialog
                trigger={
                  <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                    Get Started Now
                  </button>
                }
              />
            )}
          </div>
        </div>
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
          <img
            src="/images/landing-page/healthy-habit.svg"
            alt="hero image"
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}; 