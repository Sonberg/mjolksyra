"use client";

import { ApiClient } from "@/services/client";
import { Spinner } from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import { WorkoutPlannerDemo } from "@/components/WorkoutPlannerDemo/WorkoutPlannerDemo";
import { isBeta } from "@/constants/isBeta";
import { RegisterDialog } from "@/dialogs/RegisterDialog";
import { useValidation } from "@/hooks/useValidation";
import { useState } from "react";
import { z } from "zod";

type Point = {
  title: string;
  text?: string;
};

const points: Point[] = [
  {
    title: "For lifters, by lifters 🏋️‍♂️",
    text: "Built by passionate athletes who understand your needs.",
  },
  {
    title: "Extensive exercise library 📚",
    text: "Access over 800 exercises with detailed instructions.",
  },
  {
    title: "Add your own exercises ✍️",
    text: "Customize your training by adding personal exercises.",
  },
  {
    title: "Build and reuse workout blocks 🔄",
    text: "Save time by creating reusable training components.",
  },
  {
    title: "Drag-and-drop workout creation 🧩",
    text: "Easily design your workouts with our intuitive interface.",
  },
  {
    title: "Earn extra income weekly 💰",
    text: "Secure payments powered by Stripe, directly to your account.",
  },
  {
    title: "No upfront costs 🚀",
    text: "We only take 10% per transaction—no hidden fees.",
  },
  {
    title: "Unlimited athletes 🏃‍♂️",
    text: "Coach as many athletes as you want, with no restrictions.",
  },
  {
    title: "Track progress with media 📸",
    text: "Athletes can view workouts, upload videos, images, and log results.",
  },
];
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
              Get started with your coaching journey, create and sell workout
              today. Side-hustle for PT&apos;s, Powerlifters, Crossfitters or
              Weightlifters.
            </p>
            <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
              {isBeta ? (
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

      <section className="max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:pt-44 ">
        <h2 className="text-4xl leading-relaxed font-extrabold tracking-tight pb-8">
          Join us today!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {points.map((x) => (
            <div key={x.title} className="py-6 md:py-8 flex gap-4 items-center">
              <div className="grid gap-2">
                <div className="font-bold">{x.title}</div>
                {x.text ? <div className="text-sm">{x.text}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className=" max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-40 hidden md:grid">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h2 className="text-4xl leading-relaxed font-extrabold tracking-tight pb-8">
            Try our planner!
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
        <div className="text-sm">Want to stay in touch?</div>

        <Input
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="You email"
        />
        <button
          className="bg-accent-foreground text-accent rounded-full px-6 py-4 hover:bg-accent-foreground/90 font-semibold"
          disabled={isSubmitted}
          onClick={onSubmit}
        >
          {isLoading ? <Spinner size={8} /> : null}
          {isSubmitted ? "Thank you!" : "Sign me up"}
        </button>
      </div>
    </>
  );
};
