"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BellIcon, CheckIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { useAuth } from "@/context/Auth";
import { useUserEvents } from "@/context/UserEvents";
import { cn } from "@/lib/utils";
import { getNotifications } from "@/services/notifications/getNotifications";
import { markAllNotificationsRead } from "@/services/notifications/markAllNotificationsRead";
import { markNotificationRead } from "@/services/notifications/markNotificationRead";
import type { NotificationItem } from "@/services/notifications/type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type NavigationNotificationsProps = {
  forceVisible?: boolean;
};

export function NavigationNotifications({
  forceVisible = false,
}: NavigationNotificationsProps) {
  const dropdownVars = {
    "--shell-surface": "#fff7ec",
    "--shell-surface-strong": "#ecdcc5",
    "--shell-border": "#2a241d",
    "--shell-ink": "#101010",
    "--shell-muted": "#5e5448",
    "--shell-accent": "#f03a17",
  } as CSSProperties;

  const auth = useAuth();
  const userEvents = useUserEvents();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [showArrivalPulse, setShowArrivalPulse] = useState(false);
  const [showBellRing, setShowBellRing] = useState(false);
  const prevUnreadCountRef = useRef(0);

  const unread = useMemo(() => items.filter((x) => !x.readAt), [items]);
  const read = useMemo(() => items.filter((x) => !!x.readAt), [items]);

  const refresh = useCallback(async () => {
    if (!auth.isAuthenticated) return;
    setIsLoading(true);
    try {
      const accessToken = await auth.getAccessToken();
      const data = await getNotifications({ accessToken });
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 30000);

    const unsubscribe = userEvents.subscribe("user.updated", () => {
      void refresh();
    });

    return () => {
      window.clearInterval(interval);
      unsubscribe();
    };
  }, [auth, auth.isAuthenticated, refresh, userEvents]);

  useEffect(() => {
    if (open) {
      void refresh();
    }
  }, [open, refresh]);

  useEffect(() => {
    const prev = prevUnreadCountRef.current;

    if (unreadCount > prev) {
      setShowArrivalPulse(true);
      setShowBellRing(true);
      const timeout = window.setTimeout(() => {
        setShowArrivalPulse(false);
        setShowBellRing(false);
      }, 1400);

      prevUnreadCountRef.current = unreadCount;
      return () => window.clearTimeout(timeout);
    }

    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  if (!auth.isAuthenticated && !forceVisible) {
    return null;
  }

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      const accessToken = await auth.getAccessToken();
      await markAllNotificationsRead({ accessToken });
      setItems((prev) => prev.map((x) => ({ ...x, readAt: x.readAt ?? new Date() })));
      setUnreadCount(0);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleOpenNotification = async (item: NotificationItem) => {
    if (!item.readAt) {
      const accessToken = await auth.getAccessToken();
      await markNotificationRead({ id: item.id, accessToken });
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, readAt: new Date() } : x)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const renderItem = (item: NotificationItem) => {
    const content = (
      <div
        className={cn(
          "rounded-none border-2 px-3 py-2 transition",
          item.readAt
            ? "border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-muted)]"
            : "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{item.title}</p>
          {!item.readAt ? (
            <span className="mt-1 inline-block h-2 w-2 rounded-none bg-[var(--shell-accent)]" />
          ) : null}
        </div>
        {item.body ? <p className="mt-1 text-xs text-[var(--shell-muted)]">{item.body}</p> : null}
        <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[var(--shell-muted)]">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </p>
      </div>
    );

    if (item.href) {
      return (
        <Link
          key={item.id}
          href={item.href}
          onClick={() => void handleOpenNotification(item)}
          className="block"
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => void handleOpenNotification(item)}
        className="block w-full text-left"
      >
        {content}
      </button>
    );
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative inline-flex h-10 w-10 items-center justify-center rounded-none border-2 border-[var(--shell-border)] transition",
            open
              ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
              : "bg-[var(--shell-surface)] text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]",
          )}
          aria-label="Open notifications"
        >
          <BellIcon
            className={cn("h-4 w-4 origin-top", showBellRing ? "animate-bell-ring" : "")}
          />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-none bg-[var(--shell-accent)]/40",
                  showArrivalPulse ? "animate-ping" : "opacity-0",
                )}
              />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)]" />
            </span>
          ) : null}
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-1.5 text-[10px] font-bold text-[var(--shell-surface)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        style={dropdownVars}
        className="w-[22rem] rounded-none border-2 border-[var(--shell-border)] bg-[#fff7ec] p-0 text-black"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-[var(--shell-ink)]">
            Notifications
          </DropdownMenuLabel>
          <button
            type="button"
            disabled={unreadCount === 0 || isMarkingAll}
            onClick={() => void handleMarkAllRead()}
            className="inline-flex items-center gap-1 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-1 text-xs text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-50"
          >
            <CheckIcon className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
        <DropdownMenuSeparator className="bg-[var(--shell-border)]" />
        <div className="max-h-[28rem] overflow-y-auto p-3">
          {isLoading && items.length === 0 ? (
            <p className="text-sm text-[var(--shell-muted)]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-4 text-sm text-[var(--shell-muted)]">
              No notifications yet.
            </p>
          ) : (
            <div className="space-y-4">
              {unread.length > 0 ? (
                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                    New
                  </p>
                  <div className="space-y-2">{unread.map(renderItem)}</div>
                </section>
              ) : null}
              {read.length > 0 ? (
                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                    Earlier
                  </p>
                  <div className="space-y-2">{read.map(renderItem)}</div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
