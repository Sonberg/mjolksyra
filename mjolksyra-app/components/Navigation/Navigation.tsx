"use client";

import Link from "next/link";
import { NavigationUser } from "./NavigationUser";
import { Button } from "../ui/button";
import { useAuth } from "@/context/Auth";
import { LoginDialog } from "@/dialogs/LoginDialog";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getTrainees } from "@/services/trainees/getTrainees";

export function Navigation() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isCoachActive = pathname.startsWith("/app/coach");
  const isAthleteActive = pathname.startsWith("/app/athlete");
  const { data: trainees = [] } = useQuery({
    queryKey: ["trainees", "nav"],
    queryFn: ({ signal }) => getTrainees({ signal }),
    enabled: auth.isAuthenticated,
  });
  const hasAthletes = trainees.length > 0;

  const [showBorder, setShowBorder] = useState(() =>
    pathname === "/" ? false : true,
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
        "sticky top-0 z-50 flex flex-col bg-[#090909] transition-colors",
        {
          "border-b border-zinc-900": showBorder,
        },
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1380px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group text-base font-medium transition-colors"
        >
          <div className="mr-3 flex items-center px-2.5 py-1.5">
            <Image
              className="mr-2 h-7 w-7"
              alt="Logo"
              width={28}
              height={28}
              src={"/images/logo.svg"}
            />
            <div className="font-[var(--font-display)] text-xl font-semibold text-zinc-100">
              mjölksyra
            </div>
          </div>
        </Link>

        <div className="ml-auto flex items-center space-x-3">
          <nav className="hidden items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                    isCoachActive
                      ? "bg-zinc-100 text-black"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
                  )}
                >
                  Coach
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="border-zinc-700 bg-zinc-950 text-zinc-100"
              >
                <DropdownMenuItem
                  className="focus:bg-zinc-900 focus:text-zinc-100"
                  onSelect={() => router.push("/app/coach")}
                >
                  Dashboard
                </DropdownMenuItem>
                {hasAthletes ? (
                  <DropdownMenuItem
                    className="focus:bg-zinc-900 focus:text-zinc-100"
                    onSelect={() => router.push("/app/coach")}
                  >
                    Athletes ({trainees.length})
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  className="focus:bg-zinc-900 focus:text-zinc-100"
                  onSelect={() => router.push("/app/coach/blocks")}
                >
                  Blocks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/app/athlete"
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                isAthleteActive
                  ? "bg-zinc-100 text-black"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
              )}
            >
              Athlete
            </Link>
          </nav>
          {auth.isAuthenticated ? (
            <NavigationUser />
          ) : (
            <>
              <Link
                href="/app/coach"
                className="hidden items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200 sm:inline-flex"
              >
                Explore
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <LoginDialog
                trigger={
                  <Button
                    variant="ghost"
                    className="rounded-xl border border-zinc-700 bg-zinc-100 px-4 font-semibold text-black hover:bg-zinc-300"
                  >
                    Login
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
