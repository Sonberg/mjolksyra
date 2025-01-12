"use client";

import Link from "next/link";
import { NavigationUser } from "./NavigationUser";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/Auth";
import { BicepsFlexedIcon, DumbbellIcon } from "lucide-react";
import { LoginDialog } from "@/dialogs/LoginDialog";

export function Navigation() {
  const path = usePathname();
  const theme = useTheme();
  const auth = useAuth();

  const logo =
    theme.resolvedTheme == "light"
      ? "/images/logo-light.png"
      : "/images/logo-dark.png";
      
  return (
    <div className=" flex-col flex">
      <div className={path === "/" ? "" : "border-b"}>
        <div className="flex h-16 items-center px-4">
          <Link
            href="/"
            className="text-base font-medium transition-colors hover:text-primary"
          >
            <div className="font-bold text-xl mr-4 flex items-center">
              <img
                className="h-8 w-8 mr-2"
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
    </div>
  );
}
