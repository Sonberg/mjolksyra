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
      {/* Logo — milk carton scaled to 48×46 box */}
      <g transform="translate(95, 84) scale(0.36)" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
        <rect className="hi-ink-s" height="74" width="68" x="19" y="50" />
        <polygon className="hi-ink-s" points="109 116 87 124 87 50 109 42 109 116" />
        <polyline className="hi-ink-s" points="54.94 22 27 22 19 50 87 50 95 22 65.12 22" />
        <polyline className="hi-ink-s" points="109 42 95 22 95 12 78.05 12" />
        <polyline className="hi-ink-s" points="27 22 27 12 65.25 12" />
        <path className="hi-ink-s" d="M19,68s13-11,34,0,34,0,34,0A58.29,58.29,0,0,0,98,58c5-6,11-5,11-5" />
        <path className="hi-ink-s" d="M19,108.1s13-11,34,0,34,0,34,0a58.41,58.41,0,0,0,11-10c5-6,11-5,11-5" />
        <path className="hi-ink-s" d="M31,96.12l.11-7.29.06-3.68c0-.64,0-1.29,0-1.93a3.57,3.57,0,0,1,.25-1.81c.4-.62,1-.34,1.25.23.76,2.13,1.59,4.24,2.41,6.35a1,1,0,0,0,1.6.29A9.16,9.16,0,0,0,38.49,85c.39-1.09.66-2.84,1.61-3.75a.73.73,0,0,1,1.21.48c.22,2.18.1,4.4.12,6.59q0,4-.11,7.92" />
        <path className="hi-ink-s" d="M47.13,81V96.2" />
        <path className="hi-ink-s" d="M52.71,81c.21,4.77-.4,9.59.49,14.3a.73.73,0,0,0,.19.44,1.16,1.16,0,0,0,.6.2,36,36,0,0,0,7.19.15" />
        <path className="hi-ink-s" d="M65.63,81q-.22,7.65.23,15.31a22.34,22.34,0,0,1,.32-4.54,7,7,0,0,1,.91-2.89,9.13,9.13,0,0,1,1.84-2c2-1.69,4.13-3.25,6.27-4.81a39.33,39.33,0,0,0-4.18,3,5.32,5.32,0,0,0-1.55,1.55,3.07,3.07,0,0,0-.34,1.7c.15,2.17,2,4,3.69,5.62L76,97" />
        <path className="hi-ink-s" d="M53.81,27.27A9,9,0,0,0,56,45a9.33,9.33,0,0,0,2-.22,9,9,0,0,0,3.25-16.09" />
        <path className="hi-ink-s" d="M58,44.78l3.25-16.09.89-4.37,2.8-2.17.19-.15L78.05,12l1.18-.91,0,0" />
        <path className="hi-ink-s" d="M75,4.44c1.25-1,3.23-.29,4.41,1.54s1.13,4.08-.12,5.06l0,0a2.2,2.2,0,0,1-.25.17,2,2,0,0,1-.34.13,1.09,1.09,0,0,1-.3.07,2.05,2.05,0,0,1-.7,0l-.17,0a2,2,0,0,1-.33-.08,3.44,3.44,0,0,1-1.22-.67c-.13-.11-.26-.22-.38-.34a5.1,5.1,0,0,1-.68-.84,4.11,4.11,0,0,1-.37-.68,4.59,4.59,0,0,1-.27-.7,4.26,4.26,0,0,1-.07-2.39,2.46,2.46,0,0,1,.14-.38,1.15,1.15,0,0,1,.14-.27.86.86,0,0,1,.1-.16,1.92,1.92,0,0,1,.18-.22A1.73,1.73,0,0,1,75,4.44L65.25,12l-9.93,7.69,0,0-.28,1.72-.12.55-1.13,5.27L50.42,43.05" />
        <path className="hi-ink-s" d="M79.3,11c-1.26,1-3.23.29-4.42-1.54S73.75,5.42,75,4.44,78.24,4.16,79.42,6,80.55,10.06,79.3,11Z" />
      </g>
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
