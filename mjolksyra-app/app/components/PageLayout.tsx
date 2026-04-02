import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  fullBleed?: boolean;
  navigation?: {
    tabs: ReactNode;
    rightContent?: ReactNode;
  };
};

export function PageLayout({ children, fullBleed = false, navigation }: Props) {
  return (
    <div className="font-[var(--font-body)] relative mx-auto w-full overflow-x-clip overflow-y-visible">
      {navigation ? (
        <div className="sticky top-0 z-40 border-b border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface),transparent_10%)] px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--shell-surface),transparent_6%)]">
          <div className="mx-auto w-full max-w-6xl md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">{navigation.tabs}</div>
              {navigation?.rightContent ? (
                <div className="shrink-0">{navigation.rightContent}</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <div
        className={[
          "mx-auto w-full max-w-6xl space-y-8 ",
          fullBleed ? "max-w-none pt-0" : "px-4 md:px-6 pt-8 md:pt-16",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
