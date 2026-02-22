"use client";

export const StripeSection = () => {
  return (
    <section className="bg-zinc-950/30 py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4 text-center">
        <h2 className="mb-12 bg-gradient-to-r from-zinc-100 to-white bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
          Powered by Stripe
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/70 p-8 backdrop-blur-sm">
            <img
              src="/images/stripe-white.svg"
              alt="Stripe logo"
              className="mx-auto mb-6 h-12 w-auto"
            />
            <p className="text-lg text-zinc-400">
              Secure payments and automated weekly payouts directly to your bank
              account
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}; 
