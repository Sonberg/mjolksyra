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
          <div className="mb-6 inline-flex items-center gap-2 rounded-none border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--home-text)]">
            <span className="h-1.5 w-1.5 rounded-none bg-[var(--home-accent)]" />
            AI-powered coaching platform
          </div>
          <h1 className="font-[var(--font-display)] mb-8 max-w-2xl text-4xl leading-tight tracking-tight md:text-5xl xl:text-6xl">
            <span className="text-[var(--home-text)]">
              Coaching software for strength coaches —{" "}
            </span>
            <span style={{ color: "var(--home-accent)" }}>with AI</span>
          </h1>
          <p className="mb-6 max-w-2xl text-[var(--home-muted)] md:text-lg lg:text-xl">
            Mjolksyra helps online strength coaches build training blocks,
            manage athletes, analyze workout video, and deliver structured
            feedback from one workspace.
          </p>
          <div className="mb-8 flex flex-wrap gap-2">
            {[
              "AI workout planner",
              "Workout video analysis",
              "Drag-and-drop block builder",
              "Athlete chat and feedback",
            ].map((label) => (
              <span
                key={label}
                className="border border-[var(--home-border)] bg-[var(--home-surface-strong)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--home-muted)]"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="space-y-3 sm:flex sm:space-x-3 sm:space-y-0 sm:items-center">
            {isBeta ? (
              <SignupForm />
            ) : (
              <>
                <RegisterDialog
                  trigger={
                    <button className="inline-flex items-center justify-center rounded-none border border-transparent bg-[var(--home-accent)] px-8 py-4 text-lg font-semibold text-[var(--home-accent-ink)] transition hover:bg-[var(--home-accent-hover)]">
                      Start free trial
                    </button>
                  }
                />
                <a
                  href="#planner-demo"
                  className="inline-flex items-center justify-center rounded-none px-2 py-4 text-sm font-medium text-[var(--home-muted)] underline-offset-4 hover:underline transition"
                >
                  Try live demo
                </a>
                <span className="text-sm text-[var(--home-muted)]">
                  14-day free trial. Cancel anytime.
                </span>
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
