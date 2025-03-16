"use client";

import { RegisterDialog } from "@/dialogs/RegisterDialog";

export const CTASection = () => {
  return (
    <section className="py-20 lg:py-32 bg-gray-950/30">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
          Ready to start your coaching journey?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Join our community of successful coaches and start building your
          fitness business today.
        </p>
        <RegisterDialog
          trigger={
            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              Get Started Now
            </button>
          }
        />
      </div>
    </section>
  );
}; 