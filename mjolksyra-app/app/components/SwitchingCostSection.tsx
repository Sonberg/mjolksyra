import { FileSpreadsheetIcon, FileTextIcon, FileJsonIcon, FileIcon } from "lucide-react";

const formats = [
  { label: "CSV", icon: FileTextIcon },
  { label: "Excel", icon: FileSpreadsheetIcon },
  { label: "PDF", icon: FileIcon },
  { label: "Word", icon: FileTextIcon },
  { label: "JSON", icon: FileJsonIcon },
];

const mockSessions = [
  { day: "Mon", name: "Squat + Bench", sets: 6 },
  { day: "Wed", name: "Deadlift + OHP", sets: 5 },
  { day: "Fri", name: "Squat + Bench", sets: 6 },
];

export function SwitchingCostSection() {
  return (
    <section className="relative overflow-hidden bg-[#151515] py-20 lg:py-32 dark:bg-[#0b0b0b]">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative mx-auto max-w-screen-xl px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left: copy */}
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/60">
              Migration
            </p>
            <h2 className="font-[var(--font-display)] text-3xl text-white md:text-4xl">
              Don&apos;t start from scratch.
            </h2>
            <p className="mt-4 max-w-md text-white/70">
              Drop your existing program into the AI planner — spreadsheet, PDF, Word doc, whatever you have. It reads the structure and rebuilds it as a training block. You review every change before anything is applied.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {formats.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white/70"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.12em] text-white/40">
              No structured format required — AI figures out the rest.
            </p>
          </div>

          {/* Right: mock */}
          <div className="flex flex-col gap-3">
            {/* Dropped file */}
            <div className="border border-white/20 bg-white/5 px-3 py-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">
                <FileSpreadsheetIcon className="h-3.5 w-3.5" />
                <span>current_program.xlsx</span>
                <span className="ml-auto text-white/30">attached</span>
              </div>
              <p className="text-xs text-white/80">
                &quot;Import my current 4-week block. 3 sessions per week, powerlifting focus.&quot;
              </p>
            </div>

            {/* AI response */}
            <div className="border border-white/30 bg-white/10 px-3 py-2.5 flex flex-col gap-2.5">
              <p className="text-xs font-semibold text-white">
                Found 4 weeks, 3 sessions each. Here&apos;s Week 1 — does this look right?
              </p>

              <div className="border border-white/15 bg-black/30 px-2.5 py-2 flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
                  Week 1 · Accumulation
                </p>
                {mockSessions.map((s) => (
                  <div key={s.day} className="flex items-center gap-3 text-[11px]">
                    <span className="w-7 shrink-0 font-semibold uppercase tracking-[0.06em] text-white/40">
                      {s.day}
                    </span>
                    <span className="flex-1 text-white/80">{s.name}</span>
                    <span className="font-mono text-white/40">{s.sets} sets</span>
                  </div>
                ))}
                <p className="mt-1 text-[10px] text-center uppercase tracking-widest text-white/30 border-t border-white/10 pt-1.5">
                  + 3 more weeks
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-0.5">
                <span className="border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
                  Discard
                </span>
                <span className="bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black">
                  Apply block
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
