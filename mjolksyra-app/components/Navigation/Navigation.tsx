"use client";

import Link from "next/link";
import { NavigationUser } from "./NavigationUser";
import { NavigationNotifications } from "./NavigationNotifications";
import { SelectionTabs } from "./SelectionTabs";
import { Button } from "../ui/button";
import { useAuth } from "@/context/Auth";
import { LoginDialog } from "@/dialogs/LoginDialog";
import { RegisterDialog } from "@/dialogs/RegisterDialog";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavigationAuthSnapshot = {
  isAuthenticated: boolean;
  name: string | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  isAdmin?: boolean;
};

type NavigationProps = {
  initialAuth?: NavigationAuthSnapshot;
};

export function Navigation({ initialAuth }: NavigationProps) {
  const auth = useAuth();
  const pathname = usePathname();
  const isCoachActive = pathname.startsWith("/app/coach");
  const isAthleteActive = pathname.startsWith("/app/athlete");
  const isAuthenticated = initialAuth?.isAuthenticated ?? auth.isAuthenticated;
  const user = {
    name: initialAuth?.name ?? auth.name ?? null,
    email: initialAuth?.email ?? auth.email ?? null,
    givenName: initialAuth?.givenName ?? auth.givenName ?? null,
    familyName: initialAuth?.familyName ?? auth.familyName ?? null,
  };

  const roleTabs = [
    { key: "coach", href: "/app/coach/dashboard", label: "Coach" },
    { key: "athlete", href: "/app/athlete", label: "Athlete" },
  ] as const;
  const activeRoleTab = isCoachActive
    ? "coach"
    : isAthleteActive
      ? "athlete"
      : undefined;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex flex-col border-b-2 border-[var(--shell-border)] bg-[var(--shell-surface)] backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 md:px-6">
        <Link
          href="/"
          className="group text-base font-medium transition-transform duration-200"
        >
          <div className="mr-1 flex items-center rounded-none">
            <Image
              className="h-10 w-10 dark:invert"
              alt="Logo"
              width={34}
              height={34}
              src={"/images/logo.svg"}
            />
          </div>
        </Link>
        <div
          className={cn(
            "ml-auto flex shrink-0 items-center gap-1 sm:gap-2",
          )}
        >
          {isAuthenticated ? (
            <SelectionTabs
              items={roleTabs}
              activeKey={activeRoleTab}
              size="md"
              className="!inline-flex md:!hidden"
              itemClassName="text-sm"
            />
          ) : null}
          {isAuthenticated ? (
            <SelectionTabs
              items={roleTabs}
              activeKey={activeRoleTab}
              className="ml-auto !hidden md:!inline-flex"
              itemClassName="text-sm"
            />
          ) : null}
          {isAuthenticated ? (
            <>
              <NavigationNotifications forceVisible={isAuthenticated} />
              <NavigationUser
                user={user}
                isAdmin={initialAuth?.isAdmin ?? false}
              />
            </>
          ) : (
            <>
              <RegisterDialog
                trigger={
                  <Button className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] px-4 font-semibold text-[var(--shell-surface)] transition-colors hover:bg-[#ce2f10]">
                    Start free trial
                  </Button>
                }
              />
              <LoginDialog
                trigger={
                  <Button
                    variant="outline"
                    className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 font-medium text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]"
                  >
                    Log in
                  </Button>
                }
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
