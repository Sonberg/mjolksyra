"use client";

import Link from "next/link";
import { NavigationUser } from "./NavigationUser";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/Auth";
import { BicepsFlexedIcon, DumbbellIcon } from "lucide-react";
import { LoginDialog } from "@/dialogs/LoginDialog";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const theme = useTheme();
  const auth = useAuth();
  const pathname = usePathname();

  const [showBorder, setShowBorder] = useState(() =>
    pathname === "/" ? false : true
  );

  const logo =
    theme.resolvedTheme == "light"
      ? "/images/logo-light.png"
      : "/images/logo-dark.png";

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
          const newState = (ev.target as HTMLElement).scrollTop > 50;

          if (newState !== showBorder) {
            setShowBorder(newState);
          }
        },
        {
          signal: controller.signal,
        }
      );
    }

    return () => {
      controller.abort();
    };
  }, [pathname, showBorder]);

  return (
    <div
      className={cn({
        "flex-col flex": true,
        "border-b": showBorder,
      })}
    >
      <div className="flex h-16 items-center px-4">
        <Link
          href="/"
          className="text-base font-medium transition-colors hover:text-primary"
        >
          <div className="font-bold text-xl mr-4 flex items-center">
            <Image
              className="h-8 w-8 mr-2"
              alt="Logo"
              width={32}
              height={32}
              src={logo}
              data-theme={theme.resolvedTheme}
            />
            <div>mjölksyra</div>
          </div>
        </Link>
        <nav className={"flex items-center space-x-4 lg:space-x-6 mx-4"}>
          {auth.isAuthenticated ? (
            <>
              <Link
                href="/workouts"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex gap-1 items-center"
              >
                <DumbbellIcon className="h-4" />
                Workouts
              </Link>
              <Link
                href="/athletes"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex gap-1 items-center"
              >
                <BicepsFlexedIcon className="h-4" />
                Athletes
              </Link>
            </>
          ) : null}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          {auth.isAuthenticated ? (
            <NavigationUser />
          ) : (
            <LoginDialog trigger={<Button variant="ghost">Login</Button>} />
          )}
        </div>
      </div>
    </div>
  );
}
