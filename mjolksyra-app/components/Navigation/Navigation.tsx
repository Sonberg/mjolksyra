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
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { shellRoleLinkClass } from "./shellStyles";

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

  const [showHomeBorder, setShowHomeBorder] = useState(false);
  const showBorder = pathname !== "/" || showHomeBorder;
  const roleLinkClass = (isActive: boolean) => shellRoleLinkClass(isActive);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (pathname !== "/") {
      return;
    }

    const controller = new AbortController();
    const elements = document.querySelectorAll(".overflow-y-auto");

    for (const element of elements) {
      element.addEventListener(
        "scroll",
        (ev) => {
          setShowHomeBorder((ev.target as HTMLElement).scrollTop > 50);
        },
        {
          signal: controller.signal,
        },
      );
    }

    return () => {
      controller.abort();
    };
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex flex-col transition-all duration-300",
        showBorder
          ? "border-b-2 border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface),transparent_8%)] backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group text-base font-medium transition-transform duration-200 hover:scale-[1.01]"
        >
          <div className="mr-1 flex items-center rounded-none px-2 py-1.5 sm:mr-3 sm:px-3 sm:py-2">
            <Image
              className="mr-1.5 h-7 w-7 sm:mr-2 sm:h-8 sm:w-8"
              alt="Logo"
              width={32}
              height={32}
              src={"/images/logo.svg"}
            />
          </div>
        </Link>
        <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated ? (
            <nav className="hidden items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-1 md:flex">
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
        <div className="px-3 pb-2 pt-1 md:hidden">
          <nav className="mx-auto flex w-full max-w-[1800px] items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-1">
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
