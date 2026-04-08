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
        .hi-bg { fill: #f3f3f2; }
        .hi-surface { fill: #ffffff; }
        .hi-surface-strong { fill: #ecebea; }
        .hi-surface-accent { fill: #1f1f1f; }
        .hi-border { stroke: #d5d2cf; }
        .hi-border-soft { stroke: #e3e0dd; }
        .hi-ink { fill: #1f1f1f; }
        .hi-muted { fill: #77716a; }
        .hi-soft { fill: #98918a; }
        .hi-line { fill: none; stroke: #d5d2cf; }
        .hi-line-strong { fill: none; stroke: #1f1f1f; }
        .hi-display { font-family: var(--font-display, 'Geist', 'Helvetica Neue', 'Avenir Next', system-ui, sans-serif); }
        .hi-body { font-family: var(--font-body, 'Geist', 'Helvetica Neue', 'Avenir Next', system-ui, sans-serif); }

        .dark .hi-bg, [data-theme="dark"] .hi-bg { fill: #171717; }
        .dark .hi-surface, [data-theme="dark"] .hi-surface { fill: #1f1f1f; }
        .dark .hi-surface-strong, [data-theme="dark"] .hi-surface-strong { fill: #262626; }
        .dark .hi-surface-accent, [data-theme="dark"] .hi-surface-accent { fill: #f3f3f2; }
        .dark .hi-border, [data-theme="dark"] .hi-border { stroke: #3a3a3a; }
        .dark .hi-border-soft, [data-theme="dark"] .hi-border-soft { stroke: #313131; }
        .dark .hi-ink, [data-theme="dark"] .hi-ink { fill: #f3f3f2; }
        .dark .hi-muted, [data-theme="dark"] .hi-muted { fill: #b0aaa3; }
        .dark .hi-soft, [data-theme="dark"] .hi-soft { fill: #8f8a84; }
        .dark .hi-line, [data-theme="dark"] .hi-line { stroke: #3a3a3a; }
        .dark .hi-line-strong, [data-theme="dark"] .hi-line-strong { stroke: #f3f3f2; }
      `}</style>

      <rect width="1200" height="900" className="hi-bg" />

      <rect x="28" y="28" width="1144" height="844" className="hi-surface hi-border" strokeWidth="3" />

      <rect x="28" y="28" width="1144" height="72" className="hi-surface hi-border" strokeWidth="3" />
      <g transform="translate(56 47) scale(0.22)" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
        <rect className="hi-line-strong" height="74" width="68" x="19" y="50" />
        <polygon className="hi-line-strong" points="109 116 87 124 87 50 109 42 109 116" />
        <polyline className="hi-line-strong" points="54.94 22 27 22 19 50 87 50 95 22 65.12 22" />
        <polyline className="hi-line-strong" points="109 42 95 22 95 12 78.05 12" />
        <polyline className="hi-line-strong" points="27 22 27 12 65.25 12" />
        <path className="hi-line-strong" d="M19,68s13-11,34,0,34,0,34,0A58.29,58.29,0,0,0,98,58c5-6,11-5,11-5" />
        <path className="hi-line-strong" d="M19,108.1s13-11,34,0,34,0,34,0a58.41,58.41,0,0,0,11-10c5-6,11-5,11-5" />
      </g>
      <text x="98" y="71" className="hi-ink hi-display" fontSize="26" fontWeight="700">
        mjolksyra
      </text>
      <text x="872" y="71" className="hi-muted hi-body" fontSize="12" fontWeight="700" letterSpacing="2.4">
        COACH TRAINING SYSTEM
      </text>

      <rect x="28" y="100" width="166" height="772" className="hi-surface hi-border" strokeWidth="3" />
      <text x="52" y="144" className="hi-muted hi-body" fontSize="11" fontWeight="700" letterSpacing="2.2">
        WORKSPACE
      </text>
      <rect x="48" y="168" width="126" height="42" className="hi-surface-accent hi-border" strokeWidth="2" />
      <text x="75" y="194" fill="#ffffff" className="hi-body" fontSize="14" fontWeight="700">
        Dashboard
      </text>
      <rect x="48" y="222" width="126" height="42" className="hi-surface hi-border-soft" strokeWidth="2" />
      <rect x="48" y="276" width="126" height="42" className="hi-surface hi-border-soft" strokeWidth="2" />
      <rect x="48" y="330" width="126" height="42" className="hi-surface hi-border-soft" strokeWidth="2" />
      <text x="78" y="248" className="hi-muted hi-body" fontSize="14" fontWeight="600">
        Athletes
      </text>
      <text x="88" y="302" className="hi-muted hi-body" fontSize="14" fontWeight="600">
        Blocks
      </text>
      <text x="82" y="356" className="hi-muted hi-body" fontSize="14" fontWeight="600">
        Credits
      </text>

      <rect x="194" y="100" width="654" height="772" className="hi-surface hi-border" strokeWidth="3" />
      <rect x="194" y="100" width="654" height="84" className="hi-surface hi-border" strokeWidth="3" />
      <text x="226" y="136" className="hi-muted hi-body" fontSize="11" fontWeight="700" letterSpacing="2.2">
        COACH DASHBOARD
      </text>
      <text x="226" y="164" className="hi-ink hi-display" fontSize="26" fontWeight="700">
        Plan sessions. Review form. Keep athletes moving.
      </text>

      <rect x="226" y="214" width="182" height="118" className="hi-surface-strong hi-border" strokeWidth="2" />
      <rect x="430" y="214" width="182" height="118" className="hi-surface-strong hi-border" strokeWidth="2" />
      <rect x="634" y="214" width="182" height="118" className="hi-surface-strong hi-border" strokeWidth="2" />

      <text x="244" y="244" className="hi-muted hi-body" fontSize="10" fontWeight="700" letterSpacing="2.1">
        ACTIVE ATHLETES
      </text>
      <text x="244" y="292" className="hi-ink hi-display" fontSize="40" fontWeight="700">
        24
      </text>
      <text x="448" y="244" className="hi-muted hi-body" fontSize="10" fontWeight="700" letterSpacing="2.1">
        THIS WEEK
      </text>
      <text x="448" y="292" className="hi-ink hi-display" fontSize="40" fontWeight="700">
        61
      </text>
      <text x="652" y="244" className="hi-muted hi-body" fontSize="10" fontWeight="700" letterSpacing="2.1">
        AI ACTIONS
      </text>
      <text x="652" y="292" className="hi-ink hi-display" fontSize="40" fontWeight="700">
        12
      </text>

      <rect x="226" y="362" width="590" height="212" className="hi-surface hi-border" strokeWidth="2" />
      <text x="246" y="394" className="hi-muted hi-body" fontSize="10" fontWeight="700" letterSpacing="2.1">
        UPCOMING BLOCKS
      </text>
      <rect x="246" y="418" width="168" height="132" className="hi-surface-strong hi-border-soft" strokeWidth="2" />
      <rect x="436" y="418" width="168" height="132" className="hi-surface-strong hi-border-soft" strokeWidth="2" />
      <rect x="626" y="418" width="170" height="132" className="hi-surface-strong hi-border-soft" strokeWidth="2" />
      <text x="264" y="447" className="hi-ink hi-body" fontSize="16" fontWeight="700">
        Base Build
      </text>
      <text x="264" y="472" className="hi-soft hi-body" fontSize="12">
        4 weeks · strength
      </text>
      <text x="454" y="447" className="hi-ink hi-body" fontSize="16" fontWeight="700">
        Race Prep
      </text>
      <text x="454" y="472" className="hi-soft hi-body" fontSize="12">
        3 weeks · running
      </text>
      <text x="644" y="447" className="hi-ink hi-body" fontSize="16" fontWeight="700">
        Deload
      </text>
      <text x="644" y="472" className="hi-soft hi-body" fontSize="12">
        1 week · recovery
      </text>
      <path d="M264 505H394" className="hi-line" strokeWidth="2" />
      <path d="M454 505H584" className="hi-line" strokeWidth="2" />
      <path d="M644 505H774" className="hi-line" strokeWidth="2" />
      <path d="M264 525H368" className="hi-line" strokeWidth="2" />
      <path d="M454 525H564" className="hi-line" strokeWidth="2" />
      <path d="M644 525H748" className="hi-line" strokeWidth="2" />

      <rect x="226" y="604" width="590" height="236" className="hi-surface hi-border" strokeWidth="2" />
      <text x="246" y="636" className="hi-muted hi-body" fontSize="10" fontWeight="700" letterSpacing="2.1">
        ATHLETE CONVERSATION
      </text>
      <rect x="246" y="662" width="328" height="48" className="hi-surface-strong hi-border-soft" strokeWidth="2" />
      <text x="262" y="691" className="hi-ink hi-body" fontSize="15" fontWeight="600">
        Bench felt heavy on the last two sets.
      </text>
      <rect x="412" y="728" width="384" height="48" className="hi-surface hi-border-soft" strokeWidth="2" />
      <text x="430" y="757" className="hi-muted hi-body" fontSize="15" fontWeight="600">
        Review video and shift Friday bench to Saturday.
      </text>
      <rect x="246" y="794" width="550" height="26" className="hi-surface-strong hi-border-soft" strokeWidth="2" />
      <text x="264" y="811" className="hi-soft hi-body" fontSize="11" fontWeight="700" letterSpacing="1.8">
        WRITE A MESSAGE...
      </text>

      <rect x="848" y="100" width="324" height="772" className="hi-surface hi-border" strokeWidth="3" />
      <rect x="848" y="100" width="324" height="84" className="hi-surface hi-border" strokeWidth="3" />
      <text x="872" y="136" className="hi-muted hi-body" fontSize="11" fontWeight="700" letterSpacing="2.2">
        AI ASSISTANT
      </text>
      <text x="872" y="164" className="hi-ink hi-display" fontSize="24" fontWeight="700">
        Next step
      </text>

      <rect x="872" y="214" width="276" height="162" className="hi-surface-strong hi-border" strokeWidth="2" />
      <text x="892" y="244" className="hi-muted hi-body" fontSize="10" fontWeight="700" letterSpacing="2.1">
        REVIEW
      </text>
      <text x="892" y="279" className="hi-ink hi-body" fontSize="19" fontWeight="700">
        Move Friday bench to Saturday
      </text>
      <text x="892" y="309" className="hi-soft hi-body" fontSize="13">
        Update 3 upcoming workouts and keep
      </text>
      <text x="892" y="329" className="hi-soft hi-body" fontSize="13">
        the current volume progression.
      </text>
      <rect x="892" y="346" width="100" height="22" className="hi-surface hi-border-soft" strokeWidth="2" />
      <text x="909" y="361" className="hi-muted hi-body" fontSize="10" fontWeight="700" letterSpacing="1.7">
        2 CR
      </text>

      <rect x="872" y="404" width="276" height="170" className="hi-surface hi-border" strokeWidth="2" />
      <text x="892" y="434" className="hi-muted hi-body" fontSize="10" fontWeight="700" letterSpacing="2.1">
        STAGED CHANGES
      </text>
      <rect x="892" y="454" width="236" height="34" className="hi-surface-strong hi-border-soft" strokeWidth="2" />
      <rect x="892" y="500" width="236" height="34" className="hi-surface-strong hi-border-soft" strokeWidth="2" />
      <rect x="892" y="546" width="236" height="34" className="hi-surface-strong hi-border-soft" strokeWidth="2" />
      <text x="908" y="476" className="hi-ink hi-body" fontSize="13" fontWeight="600">
        Move workout · Apr 12 → Apr 13
      </text>
      <text x="908" y="522" className="hi-ink hi-body" fontSize="13" fontWeight="600">
        Update note · bench variation
      </text>
      <text x="908" y="568" className="hi-ink hi-body" fontSize="13" fontWeight="600">
        Keep accessories unchanged
      </text>

      <rect x="872" y="606" width="276" height="234" className="hi-surface-strong hi-border" strokeWidth="2" />
      <text x="892" y="636" className="hi-muted hi-body" fontSize="10" fontWeight="700" letterSpacing="2.1">
        ASSISTANT INPUT
      </text>
      <rect x="892" y="660" width="236" height="108" className="hi-surface hi-border-soft" strokeWidth="2" />
      <text x="910" y="691" className="hi-soft hi-body" fontSize="16">
        Adjust next week after
      </text>
      <text x="910" y="718" className="hi-soft hi-body" fontSize="16">
        the athlete feedback and
      </text>
      <text x="910" y="745" className="hi-soft hi-body" fontSize="16">
        keep lower-body volume.
      </text>
      <rect x="892" y="788" width="110" height="34" className="hi-surface hi-border" strokeWidth="2" />
      <rect x="1018" y="788" width="110" height="34" className="hi-surface-accent hi-border" strokeWidth="2" />
      <text x="916" y="809" className="hi-muted hi-body" fontSize="12" fontWeight="700" letterSpacing="1.6">
        ATTACH
      </text>
      <text x="1042" y="809" fill="#ffffff" className="hi-body" fontSize="12" fontWeight="700" letterSpacing="1.6">
        APPLY
      </text>
    </svg>
  );
}
