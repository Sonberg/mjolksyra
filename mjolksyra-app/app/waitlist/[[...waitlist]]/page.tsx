import { Waitlist } from "@clerk/nextjs";

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-black px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Early access
          </p>
          <h1 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-zinc-100 md:text-5xl">
            Join the Mjolksyra Waitlist
          </h1>
          <p className="mt-3 text-sm text-zinc-400 md:text-base">
            We are rolling out access in batches. Join the waitlist and we will
            invite you when a spot opens.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-3 md:p-5">
          <Waitlist
            appearance={{
              elements: {
                card: "shadow-none border-0 bg-transparent",
                headerTitle: "text-zinc-100",
                headerSubtitle: "text-zinc-400",
                socialButtonsBlockButton:
                  "border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
                formButtonPrimary:
                  "bg-zinc-100 text-black hover:bg-zinc-300 shadow-none",
                formFieldInput:
                  "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500",
                footerActionText: "text-zinc-400",
                footerActionLink: "text-zinc-100 hover:text-white",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
