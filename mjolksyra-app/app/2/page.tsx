import Link from "next/link";
import { Alfa_Slab_One, DM_Sans } from "next/font/google";

const display = Alfa_Slab_One({ subsets: ["latin"], weight: ["400"] });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export default function PageTwo() {
  return (
    <main className={`theme-page ${body.className}`}>
      <header className="top reveal delay-1">
        <Link href="/1">Prev</Link>
        <Link href="/3">Next</Link>
      </header>

      <section className="poster reveal delay-2">
        <p className="eyebrow">THEME 02 · ORIGINAL BRUTAL</p>
        <h1 className={display.className}>BUILD BRUTAL. SHIP BEAUTIFUL.</h1>
        <p className="lede">The reference palette from your preferred `/2` direction.</p>
      </section>

      <section className="stats reveal delay-3">
        <article><span>Design debt</span><strong>Low</strong></article>
        <article><span>Implementation speed</span><strong>Fast</strong></article>
        <article><span>Clarity score</span><strong>9.6</strong></article>
      </section>

      <style>{`
        .theme-page {
          --bg: #f6eedf;
          --surface: #fff7ec;
          --surface-strong: #ecdcc5;
          --ink: #141414;
          --muted: #63584a;
          --border: #2a241d;
          --accent: #f03a17;
          min-height: 100vh;
          padding: 1rem;
          background: repeating-linear-gradient(90deg, #0000 0 42px, #00000010 42px 43px), var(--bg);
          color: var(--ink);
        }
        .top { display:flex; justify-content:space-between; align-items:center; gap:1rem; }
        .top a { color:var(--ink); text-decoration:none; border:2px solid var(--border); background:var(--surface); padding:.45rem .75rem; font-weight:700; }
        .poster { margin-top:2.6rem; border:4px solid var(--border); background:linear-gradient(135deg, var(--surface), var(--surface-strong)); padding:clamp(1rem,4vw,2.4rem); box-shadow:12px 12px 0 var(--accent); }
        .eyebrow { margin:0 0 .7rem; font-size:.78rem; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); font-weight:700; }
        h1 { margin:0; font-size:clamp(2.1rem,9vw,5.2rem); line-height:.9; letter-spacing:.01em; }
        .lede { margin:1rem 0 0; font-size:clamp(1rem,2.8vw,1.28rem); font-weight:700; max-width:56ch; }
        .stats { margin-top:1.8rem; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border:3px solid var(--border); }
        .stats article { padding:1rem; border-right:2px solid var(--border); }
        .stats article:last-child { border-right:0; }
        .stats article:nth-child(odd){ background:var(--surface); }
        .stats article:nth-child(even){ background:var(--surface-strong); }
        .stats span { display:block; font-size:.75rem; text-transform:uppercase; letter-spacing:.12em; color:var(--muted); font-weight:700; }
        .stats strong { display:block; margin-top:.45rem; font-size:1.9rem; line-height:1; }
        .reveal { opacity:0; transform:translateY(12px); animation:rise .55s cubic-bezier(.2,.7,.1,1) forwards; }
        .delay-1{animation-delay:.04s}.delay-2{animation-delay:.12s}.delay-3{animation-delay:.2s}
        @keyframes rise { to { opacity:1; transform:translateY(0);} }
        @media (max-width: 760px){ .stats{grid-template-columns:1fr;} .stats article{border-right:0; border-bottom:2px solid var(--border);} .stats article:last-child{border-bottom:0;} }
      `}</style>
    </main>
  );
}
