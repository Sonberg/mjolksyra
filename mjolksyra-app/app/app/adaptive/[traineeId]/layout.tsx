import { ReactNode } from "react";
import Link from "next/link";

type Props = {
  children: ReactNode;
  params: Promise<{ traineeId: string }>;
};

export default async function AdaptiveTraineeLayout({ children, params }: Props) {
  const { traineeId } = await params;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#f0f0f0] px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-[#0a0a0a]">
          adaptive.ai
        </span>
        <nav className="flex items-center gap-6">
          <Link
            href={`/app/adaptive/${traineeId}/coach`}
            className="text-sm text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
          >
            Coach
          </Link>
          <Link
            href={`/app/adaptive/${traineeId}/timeline`}
            className="text-sm text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
          >
            Timeline
          </Link>
          <Link
            href={`/app/adaptive/${traineeId}/settings`}
            className="text-sm text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
          >
            Settings
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
