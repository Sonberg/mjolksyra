"use client";

import Link from "next/link";
import { NavigationUser } from "./NavigationUser";
import { NavigationNotifications } from "./NavigationNotifications";
import { Button } from "../ui/button";
import { useAuth } from "@/context/Auth";
import { LoginDialog } from "@/dialogs/LoginDialog";
import { RegisterDialog } from "@/dialogs/RegisterDialog";
import Image from "next/image";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { ChevronDownIcon, HandshakeIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type NavigationAuthSnapshot = {
  isAuthenticated: boolean;
  name: string | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  isAdmin?: boolean;
  completedRoles?: ("coach" | "athlete")[];
  activeRole?: "coach" | "athlete" | null;
  showOnboardingNav?: boolean;
};

type NavigationProps = {
  initialAuth?: NavigationAuthSnapshot;
};

const roleLabels: Record<"coach" | "athlete", string> = {
  coach: "Coach",
  athlete: "Athlete",
};

const roleHrefs: Record<"coach" | "athlete", string> = {
  coach: "/app/coach/dashboard",
  athlete: "/app/athlete",
};

function setActiveRoleCookie(role: "coach" | "athlete") {
  document.cookie = `mjolksyra-active-role=${role}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function Navigation({ initialAuth }: NavigationProps) {
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthenticated = initialAuth?.isAuthenticated ?? auth.isAuthenticated;
  const completedRoles = initialAuth?.completedRoles ?? [];
  const activeRole = initialAuth?.activeRole ?? null;
  const showOnboardingNav = initialAuth?.showOnboardingNav ?? false;

  const user = {
    name: initialAuth?.name ?? auth.name ?? null,
    email: initialAuth?.email ?? auth.email ?? null,
    givenName: initialAuth?.givenName ?? auth.givenName ?? null,
    familyName: initialAuth?.familyName ?? auth.familyName ?? null,
  };

  const currentRole: "coach" | "athlete" | null = pathname.startsWith(
    "/app/coach",
  )
    ? "coach"
    : pathname.startsWith("/app/athlete")
      ? "athlete"
      : activeRole;

  // Keep the cookie in sync with the pathname-detected role so that navigating
  // to a non-role route (e.g. the home page) always reflects where the user was.
  useEffect(() => {
    const pathnameRole: "coach" | "athlete" | null = pathname.startsWith(
      "/app/coach",
    )
      ? "coach"
      : pathname.startsWith("/app/athlete")
        ? "athlete"
        : null;

    if (pathnameRole && pathnameRole !== activeRole) {
      setActiveRoleCookie(pathnameRole);
    }
  }, [activeRole, pathname]);

  const otherRole: "coach" | "athlete" | null =
    completedRoles.length === 2
      ? currentRole === "coach"
        ? "athlete"
        : "coach"
      : null;

  const isOnRoleRoute =
    pathname.startsWith("/app/coach") || pathname.startsWith("/app/athlete");

  function switchRole(role: "coach" | "athlete") {
    setActiveRoleCookie(role);
    router.push(roleHrefs[role]);
  }

  const roleTab =
    isAuthenticated && currentRole ? (
      otherRole ? (
        // Both roles complete — split button: label navigates, chevron opens dropdown
        <div
          className="inline-flex h-9 items-stretch rounded-none text-sm font-semibold text-[var(--shell-muted)] transition-colors"
        >
          <Link
            href={roleHrefs[currentRole]}
            className={cn(
              "inline-flex items-center px-4 transition-colors",
              isOnRoleRoute
                ? "bg-[var(--shell-ink)] text-[var(--shell-surface)] hover:bg-[var(--shell-accent-hover)]"
                : "bg-transparent hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]",
            )}
          >
            {roleLabels[currentRole]}
          </Link>
          <div
            className={cn(
              "w-px self-stretch",
              isOnRoleRoute ? "bg-[var(--shell-border)]" : "bg-[var(--shell-border)]",
            )}
          />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center bg-transparent px-2 transition-colors focus-visible:outline-none",
                  isOnRoleRoute
                    ? "text-[var(--shell-muted)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]"
                    : "hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]",
                )}
              >
                <ChevronDownIcon className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]"
            >
              <DropdownMenuItem
                className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]"
                onSelect={() => switchRole(otherRole)}
              >
                Switch to {roleLabels[otherRole]}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        // Single role — plain link
        <Link
          href={roleHrefs[currentRole]}
          className={cn(
            "inline-flex h-9 items-center rounded-none px-4 text-sm font-semibold transition-colors",
            isOnRoleRoute
              ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
              : "bg-transparent text-[var(--shell-muted)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]",
          )}
        >
          {roleLabels[currentRole]}
        </Link>
      )
    ) : null;

  const onboardingTab =
    isAuthenticated && showOnboardingNav ? (
      <Link
        href="/app/onboard"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-none px-3 text-sm font-semibold transition-colors",
          pathname.startsWith("/app/onboard")
            ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
            : "bg-transparent text-[var(--shell-muted)] hover:bg-[var(--shell-surface-strong)] hover:text-[var(--shell-ink)]",
        )}
        aria-label="Open onboarding"
      >
        <HandshakeIcon className="size-4" />
        <span className="hidden sm:inline">Onboarding</span>
      </Link>
    ) : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex flex-col border-b border-[var(--shell-border)] bg-[var(--shell-surface)] backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 md:px-6">
        <Link
          href="/"
          className="group text-base font-medium transition-transform duration-200"
        >
          <div className="mr-1 flex items-center rounded-none">
            <Image
              className="h-8 w-8 md:h-10 md:w-10 dark:invert"
              alt="Mjolksyra"
              width={32}
              height={32}
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
            <>
              {roleTab}
              {onboardingTab}
              <ThemeToggle />
              <NavigationNotifications forceVisible={isAuthenticated} />
              <NavigationUser
                user={user}
                isAdmin={initialAuth?.isAdmin ?? false}
                completedRoles={completedRoles}
              />
            </>
          ) : (
            <>
              <ThemeToggle />
              <RegisterDialog
                trigger={
                  <Button className="rounded-none border border-transparent bg-[var(--shell-accent)] px-4 font-semibold text-[var(--shell-accent-ink)] transition-colors hover:bg-[var(--shell-accent-hover)]">
                    Sign Up
                  </Button>
                }
              />
              <LoginDialog
                trigger={
                  <Button
                    variant="outline"
                    className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 font-medium text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]"
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
