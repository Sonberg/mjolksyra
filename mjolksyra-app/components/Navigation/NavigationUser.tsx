import { useState } from "react";
import type { CSSProperties } from "react";
import { useAuth } from "@/context/Auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGravatar } from "@/hooks/useGravatar";
import Link from "next/link";
import {
  ChevronDownIcon,
  LogOutIcon,
  MessageSquareWarningIcon,
  MoonIcon,
  PlusIcon,
  ShieldIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { ReportIssueDialog } from "./ReportIssueDialog";
import { useTheme } from "@/context/Theme";
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
  completedRoles?: ("coach" | "athlete")[];
};

export function NavigationUser({ user, isAdmin, completedRoles = [] }: NavigationUserProps) {
  const auth = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const dropdownVars = {
    "--shell-surface": "var(--shell-surface, #ffffff)",
    "--shell-surface-strong": "var(--shell-surface-strong, #e8e9ea)",
    "--shell-border": "var(--shell-border, #d0d0d0)",
    "--shell-ink": "var(--shell-ink, #1b1b1b)",
    "--shell-muted": "var(--shell-muted, #767676)",
    "--shell-accent": "var(--shell-accent, #333333)",
  } as CSSProperties;
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
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-none bg-transparent px-2 pr-2.5 text-left text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface-strong)]"
          aria-label="Open user menu"
        >
          <Avatar className="size-8">
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
          <ChevronDownIcon className="size-4 text-[var(--shell-muted)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        style={dropdownVars}
        className="w-52 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)]"
      >
        <DropdownMenuItem asChild className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]">
          <Link href="/app/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        {completedRoles.length === 1 && !completedRoles.includes("coach") && (
          <DropdownMenuItem asChild className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]">
            <Link href="/app/onboard/coach">
              <PlusIcon className="mr-2 h-4 w-4" />
              Join as coach
            </Link>
          </DropdownMenuItem>
        )}
        {completedRoles.length === 1 && !completedRoles.includes("athlete") && (
          <DropdownMenuItem asChild className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]">
            <Link href="/app/onboard/athlete">
              <PlusIcon className="mr-2 h-4 w-4" />
              Join as athlete
            </Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]">
            <Link href="/app/admin">
              <ShieldIcon className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={() => {
            setIsReportIssueOpen(true);
          }}
          className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]"
        >
          <MessageSquareWarningIcon className="mr-2 h-4 w-4" />
          Report issue
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={toggleTheme}
          className="cursor-pointer rounded-none focus:bg-[var(--shell-surface-strong)] focus:text-[var(--shell-ink)]"
        >
          {theme === "dark" ? (
            <SunIcon className="mr-2 h-4 w-4" />
          ) : (
            <MoonIcon className="mr-2 h-4 w-4" />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
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
