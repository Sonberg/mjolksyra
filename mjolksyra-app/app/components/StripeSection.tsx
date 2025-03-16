"use client";

export const StripeSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-gray-950/30">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
          Powered by Stripe
        </h2>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="bg-gray-950/50 border border-gray-800/50 backdrop-blur-sm rounded-xl p-8 w-full max-w-md">
            <img
              src="/images/stripe-white.svg"
              alt="Stripe logo"
              className="h-12 w-auto mx-auto mb-6"
            />
            <p className="text-gray-400 text-lg">
              Secure payments and automated weekly payouts directly to your bank account
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}; 