"use client";

import Link from "next/link";
import { NavigationUser } from "./NavigationUser";
import { Button } from "../ui/button";
import { useAuth } from "@/context/Auth";
import { LoginDialog } from "@/dialogs/LoginDialog";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const auth = useAuth();
  const pathname = usePathname();

  const [showBorder, setShowBorder] = useState(() =>
    pathname === "/" ? false : true
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
      className={cn(
        "flex-col flex bg-black/95 backdrop-blur-sm sticky top-0 z-50",
        {
          "border-b border-gray-800/50": showBorder,
        }
      )}
    >
      <div className="flex h-16 items-center px-4 hover:opacity-80 transition-opacity">
        <Link href="/" className="text-base font-medium transition-colors ">
          <div className="font-bold text-xl mr-4 flex items-center">
            <Image
              className="h-8 w-8 mr-2"
              alt="Logo"
              width={32}
              height={32}
              src={"/images/logo.svg"}
            />
            <div className="">mjölksyra</div>
          </div>
        </Link>

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
