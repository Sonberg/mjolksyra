"use client";

import Link from "next/link";
import { NavigationUser } from "./NavigationUser";
import { NavigationNotifications } from "./NavigationNotifications";
import { ReportIssueDialog } from "./ReportIssueDialog";
import { Button } from "../ui/button";
import { useAuth } from "@/context/Auth";
import { LoginDialog } from "@/dialogs/LoginDialog";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  const [showBorder, setShowBorder] = useState(() =>
    pathname === "/" ? false : true,
  );
  const roleLinkClass = (isActive: boolean) =>
    cn(
      "rounded-lg px-3 py-1 text-xs font-semibold transition md:py-1.5 md:text-sm",
      isActive
        ? "bg-zinc-100 text-black"
        : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
    );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (pathname !== "/") {
      setShowBorder(true);
      return;
    }

    const controller = new AbortController();
    const elements = document.querySelectorAll(".overflow-y-auto");

    for (const element of elements) {
      element.addEventListener(
        "scroll",
        (ev) => {
          setShowBorder((ev.target as HTMLElement).scrollTop > 50);
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
        "sticky top-0 z-50 flex flex-col bg-[linear-gradient(180deg,rgba(18,18,20,0.98)_0%,rgba(10,10,11,0.97)_55%,rgba(8,8,9,0.95)_100%)] transition-colors",
        {
          "border-b border-zinc-900": showBorder,
        },
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1800px] items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group text-base font-medium transition-colors"
        >
          <div className="mr-1 flex items-center px-1 py-1 sm:mr-3 sm:px-2.5 sm:py-1.5">
            <Image
              className="mr-1.5 h-7 w-7 sm:mr-2 sm:h-8 sm:w-8"
              alt="Logo"
              width={32}
              height={32}
              src={"/images/logo.svg"}
            />
            <div className="font-[var(--font-display)] text-lg leading-none font-semibold text-zinc-100 sm:text-xl">
              mjölksyra
            </div>
          </div>
        </Link>
        <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated ? (
            <nav className="hidden items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1 md:flex">
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
              <LoginDialog
                trigger={
                  <Button
                    variant="outline"
                    className="rounded-xl borderpx-4 font-semibol"
                  >
                    Login
                  </Button>
                }
              />
            </>
          )}
        </div>
      </div>
      {isAuthenticated ? (
        <div className="border-t border-zinc-900 px-3 pb-1.5 pt-1 md:hidden">
          <nav className="mx-auto flex w-full max-w-[1800px] items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 p-1">
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
