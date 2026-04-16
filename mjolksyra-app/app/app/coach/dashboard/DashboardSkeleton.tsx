import { CoachWorkspaceShell } from "../CoachWorkspaceShell";

function Sk({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <CoachWorkspaceShell>
      <div className="space-y-8">
        {/* Page header */}
        <div className="space-y-2">
          <Sk className="h-3 w-28" />
          <Sk className="h-8 w-56" />
        </div>

        {/* Metrics — 4-col */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <Sk className="h-28 w-full" />
          <Sk className="h-28 w-full" />
          <Sk className="h-28 w-full" />
          <Sk className="h-28 w-full" />
        </section>

        {/* Credits */}
        <Sk className="h-44 w-full" />

        {/* Todo — 2-col */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Sk className="h-3 w-20" />
            <Sk className="h-7 w-36" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Sk className="h-24 w-full" />
            <Sk className="h-24 w-full" />
            <Sk className="h-24 w-full" />
            <Sk className="h-24 w-full" />
          </div>
        </div>
      </div>
    </CoachWorkspaceShell>
  );
}
