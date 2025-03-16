"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  redirect,
  usePathname,
  useSelectedLayoutSegment,
} from "next/navigation";
import { useAuth } from "@/context/Auth";
import { LogOutIcon } from "lucide-react";

const client = new QueryClient();

export default function Layout({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const segment = useSelectedLayoutSegment() ?? "";
  const pathname = usePathname();
  const showLayout = pathname.endsWith(segment);

  if (!showLayout) {
    return <QueryClientProvider client={client} children={children} />;
  }

  return (
    <QueryClientProvider client={client}>
      <div className="min-h-screen bg-black">
        <div className="mt-12 px-6 mx-auto w-full max-w-screen-xl overflow-y-auto">
          <div className="flex justify-between items-center mb-16">
            <div className="text-4xl font-bold bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
              Hi {auth.givenName}!
            </div>
            <div className="flex gap-4 items-center">
              <CustomTab
                value={segment}
                options={[
                  { name: "Coach", value: "coach" },
                  { name: "Athlete", value: "athlete" },
                ]}
                onSelect={(tab) => redirect(`/app/${tab.value}`)}
              />
              <div
                className="bg-white/5 hover:bg-white/10 rounded-lg h-8 w-8 cursor-pointer grid place-items-center transition-colors"
                onClick={auth.logout}
              >
                <LogOutIcon className="h-4 text-stone-200" />
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </QueryClientProvider>
  );
}

type TabOption = {
  name: string;
  value: string;
};

type CustomTabProps = {
  options: TabOption[];
  value: string;
  onSelect: (_: TabOption) => void;
};

function CustomTab({ options, value, onSelect }: CustomTabProps) {
  function renderTab(tab: TabOption) {
    const isActive = tab.value === value;
    return (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={`radix-:ru:-content-${tab.value}`}
        data-state={isActive ? "active" : "inactive"}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-200 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:bg-gray-800/50"
        tabIndex={-1}
        onClick={() => onSelect(tab)}
      >
        {tab.name}
      </button>
    );
  }

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-950/80 p-1 text-muted-foreground border border-gray-800/50"
      tabIndex={0}
      data-orientation="horizontal"
    >
      {options.map(renderTab)}
    </div>
  );
}
