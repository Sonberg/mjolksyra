"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Alfa_Slab_One, DM_Sans } from "next/font/google";

const display = Alfa_Slab_One({ subsets: ["latin"], weight: ["400"] });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "700"] });

type ThemeMode = "light" | "dark";

export default function GreyScalePage() {
  const [mode, setMode] = useState<ThemeMode>("light");

  const nextModeLabel = useMemo(
    () => (mode === "light" ? "Switch to dark" : "Switch to light"),
    [mode],
  );

  return (
    <main className={`grey-page ${mode} ${body.className}`}>
      <header className="top reveal delay-1">
        <Link href="/">Home</Link>
        <div className="controls">
          <Link href="/5">Theme 5</Link>
          <button
            type="button"
            onClick={() => setMode((prev) => (prev === "light" ? "dark" : "light"))}
          >
            {nextModeLabel}
          </button>
        </div>
      </header>

      <section className="hero reveal delay-2">
        <p className="eyebrow">GREY SCALE MODE</p>
        <h1 className={display.className}>BLACK. WHITE. BRUTAL.</h1>
        <p className="lede">
          A monochrome system with hard borders, heavy blocks, and high contrast typography.
        </p>
      </section>

      <section className="board reveal delay-3">
        <article>
          <p>Focus</p>
          <strong>Discipline</strong>
        </article>
        <article>
          <p>Tempo</p>
          <strong>4x / week</strong>
        </article>
        <article>
          <p>Recovery</p>
          <strong>7h 42m</strong>
        </article>
      </section>

      <section className="rail reveal delay-4">
        <div className="rail-title">TODAY</div>
        <div className="rail-items">
          <span>Run intervals</span>
          <span>Dumbbell press</span>
          <span>Mobility reset</span>
        </div>
      </section>

      <style>{`
        .grey-page {
          --bg: #efede8;
          --surface: #f7f5ef;
          --surface-strong: #ded9d0;
          --ink: #151515;
          --muted: #5c5c5c;
          --border: #262626;
          min-height: 100vh;
          padding: 1rem;
          background:
            linear-gradient(180deg, #00000006, #00000000 18%),
            var(--bg);
          color: var(--ink);
          transition: background 200ms ease, color 200ms ease;
        }
        .grey-page.dark {
          --bg: #0e0e0e;
          --surface: #171717;
          --surface-strong: #242424;
          --ink: #efefef;
          --muted: #b3b3b3;
          --border: #f2f2f2;
          background:
            linear-gradient(180deg, #ffffff08, #ffffff00 16%),
            var(--bg);
        }
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .controls { display: flex; gap: .5rem; }
        .top a, .top button {
          color: var(--ink);
          text-decoration: none;
          border: 2px solid var(--border);
          background: var(--surface);
          padding: .48rem .76rem;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .top button:hover, .top a:hover { background: var(--surface-strong); }
        .hero {
          margin-top: 2rem;
          border: 4px solid var(--border);
          background: linear-gradient(130deg, var(--surface), var(--surface-strong));
          padding: clamp(1rem, 4vw, 2.4rem);
          box-shadow: 12px 12px 0 var(--border);
        }
        .eyebrow {
          margin: 0 0 .7rem;
          font-size: .78rem;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--muted);
        }
        h1 {
          margin: 0;
          font-size: clamp(2rem, 9vw, 5rem);
          line-height: .9;
        }
        .lede {
          margin: .95rem 0 0;
          max-width: 58ch;
          font-size: clamp(1rem, 2.8vw, 1.2rem);
          font-weight: 700;
        }
        .board {
          margin-top: 1.6rem;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border: 3px solid var(--border);
        }
        .board article {
          border-right: 2px solid var(--border);
          padding: 1rem;
          background: var(--surface);
        }
        .board article:nth-child(even) { background: var(--surface-strong); }
        .board article:last-child { border-right: 0; }
        .board p {
          margin: 0;
          font-size: .72rem;
          text-transform: uppercase;
          letter-spacing: .13em;
          color: var(--muted);
          font-weight: 700;
        }
        .board strong {
          display: block;
          margin-top: .45rem;
          font-size: 1.8rem;
          line-height: 1;
        }
        .rail {
          margin-top: 1.6rem;
          border: 3px solid var(--border);
          background: var(--surface);
        }
        .rail-title {
          border-bottom: 2px solid var(--border);
          padding: .75rem .9rem;
          font-size: .72rem;
          text-transform: uppercase;
          letter-spacing: .14em;
          font-weight: 700;
          color: var(--muted);
          background: var(--surface-strong);
        }
        .rail-items {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .rail-items span {
          padding: .95rem .9rem;
          border-right: 2px solid var(--border);
          font-weight: 700;
        }
        .rail-items span:last-child { border-right: 0; }
        .reveal {
          opacity: 0;
          transform: translateY(12px);
          animation: rise .55s cubic-bezier(.2,.7,.1,1) forwards;
        }
        .delay-1 { animation-delay: .04s; }
        .delay-2 { animation-delay: .12s; }
        .delay-3 { animation-delay: .2s; }
        .delay-4 { animation-delay: .28s; }
        @keyframes rise {
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 820px) {
          .board { grid-template-columns: 1fr; }
          .board article {
            border-right: 0;
            border-bottom: 2px solid var(--border);
          }
          .board article:last-child { border-bottom: 0; }
          .rail-items { grid-template-columns: 1fr; }
          .rail-items span {
            border-right: 0;
            border-bottom: 2px solid var(--border);
          }
          .rail-items span:last-child { border-bottom: 0; }
        }
      `}</style>
    </main>
  );
}

