"use client";

const benefits = [
  {
    stat: "399 kr",
    title: "Coach plan",
    text: "Flat monthly fee includes 10 athletes. No hidden costs.",
  },
  {
    stat: "39 kr",
    title: "Per extra athlete",
    text: "Scale up freely. Each athlete beyond 10 costs 39 kr/mo.",
  },
  {
    stat: "Stripe",
    title: "Secure payouts",
    text: "Automated weekly payouts directly to your bank account.",
  },
];

export const BenefitsSection = () => {
  return (
    <section className="bg-[var(--home-accent)] py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">

        <div className="mb-16 border-b-2 border-[var(--home-accent-ink)] border-opacity-20 pb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--home-accent-ink)] opacity-60">
            Pricing
          </p>
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--home-accent-ink)] md:text-4xl">
            Coach with a clear pricing model
          </h2>
        </div>

        <div className="grid grid-cols-1 divide-y-2 divide-[var(--home-accent-ink)] divide-opacity-20 md:grid-cols-3 md:divide-x-2 md:divide-y-0">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="py-10 md:px-10 md:py-0 md:first:pl-0 md:last:pr-0"
            >
              <div className="font-[var(--font-display)] mb-4 text-5xl text-[var(--home-accent-ink)]">
                {b.stat}
              </div>
              <h3 className="mb-2 text-xl text-[var(--home-accent-ink)]">{b.title}</h3>
              <p className="text-[var(--home-accent-ink)] opacity-70">{b.text}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
