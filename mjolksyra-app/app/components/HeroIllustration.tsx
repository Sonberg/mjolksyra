export function HeroIllustration() {
  return (
    <svg
      width="1200"
      height="900"
      viewBox="0 0 1200 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <style>{`
        .hi-bg-s1 { stop-color: #F6EEDF; }
        .hi-bg-s2 { stop-color: #F1E3CC; }
        .hi-glow-s1 { stop-color: #2A241D; stop-opacity: 0.16; }
        .hi-glow-s2 { stop-color: #2A241D; stop-opacity: 0; }
        .hi-surface { fill: #FFF7EC; }
        .hi-surface-strong { fill: #ECDCC5; }
        .hi-border { stroke: #2A241D; }
        .hi-ink { fill: #141414; }
        .hi-ink-s { fill: none; stroke: #141414; }
        .hi-muted { fill: #5E5448; }
        .hi-deco { fill: none; stroke: #2A241D; }
        .hi-accent-s { fill: none; stroke: #F03A17; }
        .hi-display { font-family: var(--font-display, 'Alfa Slab One', Georgia, serif); }
        .hi-body { font-family: var(--font-body, 'DM Sans', Arial, sans-serif); }

        .dark .hi-bg-s1, [data-theme="dark"] .hi-bg-s1 { stop-color: #110c0a; }
        .dark .hi-bg-s2, [data-theme="dark"] .hi-bg-s2 { stop-color: #1b1410; }
        .dark .hi-glow-s1, [data-theme="dark"] .hi-glow-s1 { stop-color: #f2e8df; stop-opacity: 0.04; }
        .dark .hi-glow-s2, [data-theme="dark"] .hi-glow-s2 { stop-color: #f2e8df; stop-opacity: 0; }
        .dark .hi-surface, [data-theme="dark"] .hi-surface { fill: #1b1410; }
        .dark .hi-surface-strong, [data-theme="dark"] .hi-surface-strong { fill: #2a1f18; }
        .dark .hi-border, [data-theme="dark"] .hi-border { stroke: #3d2e26; }
        .dark .hi-ink, [data-theme="dark"] .hi-ink { fill: #f2e8df; }
        .dark .hi-ink-s, [data-theme="dark"] .hi-ink-s { stroke: #f2e8df; }
        .dark .hi-muted, [data-theme="dark"] .hi-muted { fill: #9e8c82; }
        .dark .hi-deco, [data-theme="dark"] .hi-deco { stroke: #3d2e26; }
      `}</style>

      <defs>
        <linearGradient id="hi-bg" x1="0" y1="0" x2="1200" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" className="hi-bg-s1" />
          <stop offset="1" className="hi-bg-s2" />
        </linearGradient>
        <radialGradient id="hi-glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(210 120) rotate(18) scale(430 270)">
          <stop stopColor="#F03A17" stopOpacity="0.2" />
          <stop offset="1" stopColor="#F03A17" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hi-glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(980 780) rotate(-14) scale(500 260)">
          <stop className="hi-glow-s1" />
          <stop offset="1" className="hi-glow-s2" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="1200" height="900" fill="url(#hi-bg)" />
      <rect width="1200" height="900" fill="url(#hi-glowA)" />
      <rect width="1200" height="900" fill="url(#hi-glowB)" />

      {/* Main card */}
      <rect x="36" y="32" width="1128" height="836" className="hi-surface hi-border" strokeWidth="4" />

      {/* Header bar */}
      <rect x="72" y="64" width="1056" height="86" className="hi-surface hi-border" strokeWidth="3" />
      <rect x="94" y="84" width="48" height="46" className="hi-surface hi-border" strokeWidth="3" />
      <path d="M104 120V91H116V103H123V91H134V120" className="hi-ink-s" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="162" y="116" className="hi-ink hi-display" fontSize="42" letterSpacing="0.4">mjölksyra</text>
      <text x="842" y="116" className="hi-muted hi-body" fontSize="20" fontWeight="700" letterSpacing="3">TRAINING SYSTEM</text>

      {/* Coach view panel */}
      <rect x="72" y="182" width="670" height="648" className="hi-surface hi-border" strokeWidth="3" />
      <text x="104" y="236" className="hi-muted hi-body" fontSize="18" fontWeight="700" letterSpacing="2.8">COACH VIEW</text>
      <text x="104" y="312" className="hi-ink hi-display" fontSize="86">Run.</text>
      <text x="104" y="392" className="hi-ink hi-display" fontSize="86">Lift.</text>
      <text x="104" y="472" className="hi-ink hi-display" fontSize="86">Progress.</text>
      <text x="104" y="524" className="hi-muted hi-body" fontSize="27">Plan sessions for runners and lifters in one workspace.</text>

      {/* CTA button */}
      <rect x="104" y="566" width="292" height="62" className="hi-border" fill="#F03A17" strokeWidth="3" />
      <text x="140" y="606" className="hi-body" fill="#FFF7EC" fontSize="31" fontWeight="700">Open Planner</text>

      {/* Athletes button */}
      <rect x="410" y="566" width="230" height="62" className="hi-surface-strong hi-border" strokeWidth="3" />
      <text x="450" y="606" className="hi-ink hi-body" fontSize="31" fontWeight="600">Athletes</text>

      {/* Weekly Focus */}
      <rect x="104" y="662" width="536" height="152" className="hi-surface-strong hi-border" strokeWidth="3" />
      <text x="126" y="702" className="hi-ink hi-body" fontSize="25" fontWeight="700">Weekly Focus</text>
      <text x="126" y="738" className="hi-muted hi-body" fontSize="23">{"Mon: Intervals"}</text>
      <text x="126" y="768" className="hi-muted hi-body" fontSize="23">{"Wed: Strength"}</text>
      <text x="126" y="798" className="hi-muted hi-body" fontSize="23">{"Sat: Long Run"}</text>

      {/* Athlete snapshot panel */}
      <rect x="770" y="182" width="358" height="648" className="hi-surface hi-border" strokeWidth="3" />
      <text x="796" y="236" className="hi-muted hi-body" fontSize="18" fontWeight="700" letterSpacing="2.8">ATHLETE SNAPSHOT</text>

      {/* Running Block */}
      <rect x="796" y="266" width="306" height="158" className="hi-surface-strong hi-border" strokeWidth="3" />
      <text x="822" y="306" className="hi-ink hi-body" fontSize="24" fontWeight="700">Running Block</text>
      <path d="M824 366H1076" className="hi-deco" strokeWidth="3" />
      <path d="M824 382C850 350 876 412 902 382C928 350 954 412 980 382C1006 350 1032 412 1058 382" className="hi-accent-s" strokeWidth="4" />

      {/* Strength Block */}
      <rect x="796" y="444" width="306" height="178" className="hi-surface-strong hi-border" strokeWidth="3" />
      <text x="822" y="486" className="hi-ink hi-body" fontSize="24" fontWeight="700">Strength Block</text>
      <rect x="822" y="516" width="28" height="40" className="hi-ink" />
      <rect x="848" y="526" width="54" height="20" className="hi-ink" />
      <rect x="900" y="516" width="28" height="40" className="hi-ink" />
      <rect x="968" y="516" width="28" height="40" className="hi-ink" />
      <rect x="994" y="526" width="54" height="20" className="hi-ink" />
      <rect x="1046" y="516" width="28" height="40" className="hi-ink" />

      {/* Runner Form */}
      <rect x="796" y="642" width="306" height="158" className="hi-surface-strong hi-border" strokeWidth="3" />
      <text x="822" y="684" className="hi-ink hi-body" fontSize="24" fontWeight="700">Runner Form</text>
      <circle cx="904" cy="723" r="16" className="hi-ink" />
      <path d="M904 742L936 764L918 792" className="hi-ink-s" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M904 742L876 772L850 760" className="hi-ink-s" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M914 752L946 736" className="hi-ink-s" strokeWidth="10" strokeLinecap="round" />

      {/* Bottom line */}
      <path d="M98 844H1104" className="hi-deco" strokeWidth="1.8" opacity="0.45" />
    </svg>
  );
}
