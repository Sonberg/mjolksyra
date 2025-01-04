"use client";

import Link from "next/link";
import { NavigationUser } from "./NavigationUser";
import { usePathname } from "next/navigation";

export function Navigation() {
  const path = usePathname();
  return (
    <div className=" flex-col flex">
      <div className={path === "/" ? "" : "border-b"}>
        <div className="flex h-16 items-center px-4">
          <Link
            href="/"
            className="text-base font-medium transition-colors hover:text-primary"
          >
            <div className="font-bold text-xl mr-4 flex items-center">
              <img className="h-12 w-12" src="/images/milk.svg" />
              <div>mjölksyra</div>
            </div>
          </Link>
          <nav className={"flex items-center space-x-4 lg:space-x-6 mx-6"}>
            <Link
              href="/planner"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Planner
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <NavigationUser />
          </div>
        </div>
      </div>
    </div>
  );
}
