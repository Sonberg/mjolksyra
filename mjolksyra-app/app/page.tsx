import { WorkoutPlannerDemo } from "@/components/WorkoutPlannerDemo/WorkoutPlannerDemo";
import { RegisterDialog } from "@/dialogs/RegisterDialog";

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
              today. Side-hustle for PT's, Powerlifters, Crossfitters or
              Weightlifters.
            </p>
            <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
              <RegisterDialog
                trigger={
                  <button className="inline-flex items-center justify-center w-full bg-white px-6 py-3 text-lg font-medium text-center rounded-full sm:w-auto hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-black dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                    Get started
                  </button>
                }
              />
              {/* <a
                href="/signup"
                className="inline-flex items-center justify-center w-full px-5 py-3 mb-2 mr-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:w-auto focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Tell me more
              </a> */}
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
      <div className="">
        <h2 className="text-3xl leading-relaxed font-extrabold tracking-tight pb-8 px-6">
          Try it out
        </h2>
        <div className="border">
          <WorkoutPlannerDemo />
        </div>
      </div>
    </div>
  );
}
