import Link from "next/link";
import { NavigationUser } from "./NavigationUser";

export function Navigation() {
  return (
    <div className=" flex-col flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="font-bold text-xl mr-4">mjölksyra</div>
          <nav className={"flex items-center space-x-4 lg:space-x-6 mx-6"}>
            <Link
              href="/"
              className="text-base font-medium transition-colors hover:text-primary"
            >
              Overview
            </Link>
            <Link
              href="/trainees"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Trainees
            </Link>
            <Link
              href="/planner"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Planner
            </Link>
            <Link
              href="/examples/dashboard"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Settings
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
