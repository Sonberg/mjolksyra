import Image from "next/image";

export const StripeSection = () => {
  return (
    <section className="bg-[var(--home-surface)]/70 py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4 text-center">
        <h2 className="font-[var(--font-display)] mb-12 text-3xl text-[var(--home-text)] md:text-4xl">
          Powered by Stripe
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="w-full max-w-md rounded-none border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-8">
            <Image
              src="/images/stripe-white.svg"
              alt="Stripe logo"
              width={180}
              height={48}
              className="mx-auto mb-6 h-12 w-auto"
              loading="lazy"
            />
            <p className="text-lg text-[var(--home-muted)]">
              Secure payments and automated weekly payouts directly to your bank
              account
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}; 
