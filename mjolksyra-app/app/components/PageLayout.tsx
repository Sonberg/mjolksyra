import { NavigationTabs } from "@/components/Navigation/NavigationTabs";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  navigation?: {
    tabs: { key: string; label: string; href: string }[];
    activeTab: string;
    rightContent?: ReactNode;
  };
};

export function PageLayout({ children, navigation }: Props) {
  return (
    <div
      className={cn(
        "font-[var(--font-body)] relative mx-auto w-full overflow-x-clip overflow-y-visible",
      )}
    >
      {navigation ? (
        <div className="sticky top-0 z-40 border-b-2 border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface),transparent_10%)] px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--shell-surface),transparent_6%)]">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <NavigationTabs
              tabs={navigation.tabs}
              activeTab={navigation.activeTab}
            />
          </div>
        </div>
      ) : null}
      <div
        className={cn(
          "mx-auto w-full max-w-6xl space-y-8 pt-16",
          "px-4 md:px-6",
        )}
      >
        {children}
      </div>
    </div>
  );
}
