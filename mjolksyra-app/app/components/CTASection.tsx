"use client";

import { RegisterDialog } from "@/dialogs/RegisterDialog";

export const CTASection = () => {
  return (
    <section className="bg-zinc-950/30 py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4 text-center">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-950/70 px-6 py-12 backdrop-blur-sm md:px-10">
          <h2 className="mb-6 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
          Ready to start your coaching journey?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-400">
            Join our community of successful coaches and start building your
            fitness business today.
          </p>
          <RegisterDialog
            trigger={
              <button className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white px-8 py-4 text-lg font-semibold text-black transition hover:bg-zinc-200">
                Get Started Now
              </button>
            }
          />
        </div>
      </div>
    </section>
  );
};
