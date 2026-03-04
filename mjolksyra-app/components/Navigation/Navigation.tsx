"use client";

import Link from "next/link";
import { NavigationUser } from "./NavigationUser";
import { NavigationNotifications } from "./NavigationNotifications";
import { ReportIssueDialog } from "./ReportIssueDialog";
import { Button } from "../ui/button";
import { useAuth } from "@/context/Auth";
import { LoginDialog } from "@/dialogs/LoginDialog";
import { RegisterDialog } from "@/dialogs/RegisterDialog";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { shellRoleLinkClass, shellSegmentedContainerClass } from "./shellStyles";
import type { CSSProperties } from "react";

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

  const roleLinkClass = (isActive: boolean) => shellRoleLinkClass(isActive);
  const shellFallbackVars = {
    "--shell-surface": "var(--home-surface, #fff7ec)",
    "--shell-surface-strong": "var(--home-surface-strong, #ecdcc5)",
    "--shell-border": "var(--home-border, #2a241d)",
    "--shell-ink": "var(--home-text, #161311)",
    "--shell-muted": "var(--home-muted, #5e5448)",
    "--shell-accent": "var(--home-accent, #f03a17)",
  } as CSSProperties;

  return (
    <header
      style={shellFallbackVars}
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
              className="h-10 w-10"
              alt="Logo"
              width={34}
              height={34}
              src={"/images/logo.svg"}
            />
          </div>
        </Link>
        <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated ? (
            <nav className={cn("hidden md:flex", shellSegmentedContainerClass)}>
              <Link
                href="/app/coach/dashboard"
                className={roleLinkClass(isCoachActive)}
              >
                Coach
              </Link>

              <Link
                href="/app/athlete"
                className={roleLinkClass(isAthleteActive)}
              >
                Athlete
              </Link>
            </nav>
          ) : null}
          {isAuthenticated ? (
            <>
              <ReportIssueDialog />
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
      {isAuthenticated ? (
        <div className="mx-auto w-full max-w-6xl px-4 pb-2 pt-1 md:px-6 md:hidden">
          <nav className={cn("flex w-full", shellSegmentedContainerClass)}>
            <Link
              href="/app/coach/dashboard"
              className={cn(roleLinkClass(isCoachActive), "flex-1 text-center")}
            >
              Coach
            </Link>
            <Link
              href="/app/athlete"
              className={cn(
                roleLinkClass(isAthleteActive),
                "flex-1 text-center",
              )}
            >
              Athlete
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
