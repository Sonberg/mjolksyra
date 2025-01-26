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
      <div className="mt-12 px-6 mx-auto w-full max-w-screen-xl">
        <div className="flex justify-between items-center mb-8">
          <div className="text-4xl font-bold">Hi {auth.givenName}!</div>
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
              className="hover:bg-accent rounded p-2 cursor-pointer"
              onClick={auth.logout}
              children={<LogOutIcon className="h-5" />}
            />
          </div>
        </div>
        {children}
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
    return (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected="true"
        aria-controls="radix-:ru:-content-coach"
        data-state={tab.value === value ? "active" : "inactive"}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        tabIndex={-1}
        children={tab.name}
        onClick={() => onSelect(tab)}
      />
    );
  }

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground outline-none"
      tabIndex={0}
      data-orientation="horizontal"
      children={options.map(renderTab)}
    />
  );
}
