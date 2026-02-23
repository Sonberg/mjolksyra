import { useAuth } from "@/context/Auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGravatar } from "@/hooks/useGravatar";
import Link from "next/link";
import { LogOutIcon } from "lucide-react";

export function NavigationUser() {
  const auth = useAuth();
  const initial = (auth.givenName?.[0] ?? "") + (auth.familyName?.[0] ?? "");
  const url = useGravatar(auth.email ?? "", 32);

  return (
    <div className="flex items-center gap-2">
      <Link href="/app">
        <Avatar className="h-8 w-8 border border-zinc-700">
          <AvatarImage src={url} alt={auth.name ?? "User"} />
          <AvatarFallback className="bg-zinc-900 text-zinc-200">
            {initial.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      <button
        type="button"
        aria-label="Logout"
        onClick={auth.logout}
        className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
      >
        <LogOutIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
