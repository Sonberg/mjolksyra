"use client";

import { ApiClient } from "@/api/client";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkoutPlannerDemo } from "@/components/WorkoutPlannerDemo/WorkoutPlannerDemo";
import { isBeta } from "@/constants/isBeta";
import { RegisterDialog } from "@/dialogs/RegisterDialog";
import { useValidation } from "@/hooks/useValidation";
import { useState } from "react";
import { z } from "zod";

export default function Home() {
  return (
    <div className="overflow-y-auto">
      <section className="">
        <div className="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-44">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="max-w-2xl mb-8 text-4xl leading-relaxed font-extrabold tracking-tight md:text-5xl xl:text-6xl dark:text-white">
              Coaching plattform <br />
              for everyone.
            </h1>
            <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
              Get started with our coaching journey, create and sell workout
              today. Side-hustle for PT&apos;s, Powerlifters, Crossfitters or
              Weightlifters.
            </p>
            <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
              {isBeta || true ? (
                <SignupForm />
              ) : (
                <RegisterDialog
                  trigger={
                    <button className="inline-flex items-center justify-center w-full bg-white px-6 py-3 text-lg font-medium text-center rounded-full sm:w-auto hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-black dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                      Get started
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
            />
          </div>
        </div>
      </section>

      {/* <section className="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-44">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h2 className="text-4xl leading-relaxed font-extrabold tracking-tight pb-8">
            How much can you make?
          </h2>
        </div>
        <div className="border mr-auto place-self-center lg:col-span-12 rounded">
          Calculator
        </div>
      </section> */}
      <section className="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-44">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h2 className="text-4xl leading-relaxed font-extrabold tracking-tight pb-8">
            Try it out!
          </h2>
        </div>
        <div className="border mr-auto place-self-center lg:col-span-12 rounded shadow-xl pl-2">
          <WorkoutPlannerDemo />
        </div>
      </section>
    </div>
  );
}

const schema = z.object({
  email: z.string().email(),
});

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setSubmitted] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const validation = useValidation({
    schema,
    values: {
      email,
    },
  });

  async function onSubmit() {
    if (!validation.success) {
      return;
    }

    setLoading(true);
    await ApiClient.post("/api/signup", validation.parsed);
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <>
      <div className="w-full flex flex-col items-start gap-4">
        <div className="text-sm">
          Want to stay in touch and informed when we are lunching?
        </div>

        <Input
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="You email"
        />
        <Button disabled={isSubmitted} onClick={onSubmit} size="sm">
          {isLoading ? <Spinner size={8} /> : null}
          {isSubmitted ? "Thank you!" : "Keep me up-to-date"}
        </Button>
      </div>
    </>
  );
};
