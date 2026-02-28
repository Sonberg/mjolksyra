import { useAuth } from "@/context/Auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGravatar } from "@/hooks/useGravatar";
import Link from "next/link";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type NavigationUserProps = {
  user?: {
    name: string | null;
    email: string | null;
    givenName: string | null;
    familyName: string | null;
  } | null;
};

export function NavigationUser({ user }: NavigationUserProps) {
  const auth = useAuth();
  const resolvedUser = {
    name: user?.name ?? auth.name ?? null,
    email: user?.email ?? auth.email ?? null,
    givenName: user?.givenName ?? auth.givenName ?? null,
    familyName: user?.familyName ?? auth.familyName ?? null,
  };
  const initial =
    (resolvedUser.givenName?.[0] ?? "") + (resolvedUser.familyName?.[0] ?? "");
  const url = useGravatar(resolvedUser.email ?? "", 32);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 px-2 py-1 pr-2.5 text-left transition hover:border-zinc-700 hover:bg-zinc-900/90"
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8 border border-zinc-700">
            <AvatarImage src={url} alt={resolvedUser.name ?? "User"} />
            <AvatarFallback className="bg-zinc-900 text-zinc-200">
              {initial.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 sm:block">
            <div className="max-w-28 truncate text-xs font-medium text-zinc-100">
              {resolvedUser.givenName ?? resolvedUser.name ?? "User"}
            </div>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 border-zinc-700 bg-zinc-950 text-zinc-100"
      >
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-900 focus:text-zinc-100">
          <Link href="/app">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={auth.logout}
          className="cursor-pointer focus:bg-zinc-900 focus:text-zinc-100"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
