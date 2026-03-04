import { useState } from "react";
import { useAuth } from "@/context/Auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGravatar } from "@/hooks/useGravatar";
import Link from "next/link";
import {
  ChevronDownIcon,
  LogOutIcon,
  MessageSquareWarningIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";
import { ReportIssueDialog } from "./ReportIssueDialog";
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
  isAdmin?: boolean;
};

export function NavigationUser({ user, isAdmin }: NavigationUserProps) {
  const auth = useAuth();
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
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
          className="inline-flex items-center gap-2 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 pr-2.5 text-left text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface-strong)]"
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8 border-2 border-[var(--shell-border)]">
            <AvatarImage src={url} alt={resolvedUser.name ?? "User"} />
            <AvatarFallback className="rounded-none bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]">
              {initial.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 sm:block">
            <div className="max-w-28 truncate text-xs font-medium text-[var(--shell-ink)]">
              {resolvedUser.givenName ?? resolvedUser.name ?? "User"}
            </div>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-[var(--shell-muted)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]"
      >
        <DropdownMenuItem asChild className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]">
          <Link href="/app/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]">
            <Link href="/app/admin">
              <ShieldIcon className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            setIsReportIssueOpen(true);
          }}
          className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]"
        >
          <MessageSquareWarningIcon className="mr-2 h-4 w-4" />
          Report issue
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={auth.logout}
          className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ReportIssueDialog
        hideTrigger
        open={isReportIssueOpen}
        onOpenChange={setIsReportIssueOpen}
      />
    </DropdownMenu>
  );
}
