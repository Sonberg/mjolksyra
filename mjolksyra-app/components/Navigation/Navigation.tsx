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
      "rounded-xl px-3 py-1 text-xs font-semibold transition md:py-1.5 md:text-sm",
      isActive
        ? "bg-zinc-100 text-black shadow-[0_8px_20px_rgba(255,255,255,0.16)]"
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
        "sticky top-0 z-50 flex flex-col transition-all duration-300",
        showBorder
          ? "border-b border-zinc-800/80 bg-black/75 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-32 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -right-16 top-0 h-32 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group text-base font-medium transition-transform duration-200 hover:scale-[1.01]"
        >
          <div className="mr-1 flex items-center rounded-2xl border border-zinc-800/70 bg-zinc-950/80 px-2 py-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] sm:mr-3 sm:px-3 sm:py-2">
            <Image
              className="mr-1.5 h-7 w-7 sm:mr-2 sm:h-8 sm:w-8"
              alt="Logo"
              width={32}
              height={32}
              src={"/images/logo.svg"}
            />
            <div className="font-[var(--font-display)] text-lg leading-none font-semibold tracking-tight text-zinc-100 sm:text-xl">
              mjölksyra
            </div>
          </div>
        </Link>
        <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated ? (
            <nav className="hidden items-center gap-1 rounded-2xl border border-zinc-800/80 bg-zinc-950/75 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:flex">
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
                  <Button className="rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-300 via-lime-200 to-cyan-200 px-4 font-semibold text-black shadow-[0_10px_28px_rgba(94,234,212,0.28)] transition-all duration-200 hover:scale-[1.02] hover:from-emerald-200 hover:to-cyan-100">
                    Start free trial
                  </Button>
                }
              />
              <LoginDialog
                trigger={
                  <Button
                    variant="outline"
                    className="rounded-2xl border-zinc-700 bg-zinc-950/60 px-4 font-medium text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-zinc-900"
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
        <div className="border-t border-zinc-800/70 px-3 pb-2 pt-1 md:hidden">
          <nav className="mx-auto flex w-full max-w-[1800px] items-center gap-1 rounded-2xl border border-zinc-800/80 bg-zinc-950/75 p-1 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
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
