"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BellIcon, CheckIcon } from "lucide-react";
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
          "rounded-xl border px-3 py-2 transition",
          item.readAt
            ? "border-zinc-800 bg-zinc-950 text-zinc-300"
            : "border-zinc-700 bg-zinc-900 text-zinc-100",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{item.title}</p>
          {!item.readAt ? (
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-zinc-100" />
          ) : null}
        </div>
        {item.body ? <p className="mt-1 text-xs text-zinc-400">{item.body}</p> : null}
        <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
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
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-900/90"
          aria-label="Open notifications"
        >
          <BellIcon
            className={cn("h-4 w-4 origin-top", showBellRing ? "animate-bell-ring" : "")}
          />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full bg-red-500/70",
                  showArrivalPulse ? "animate-ping" : "opacity-0",
                )}
              />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-zinc-950 bg-red-500" />
            </span>
          ) : null}
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border border-zinc-900 bg-zinc-100 px-1.5 text-[10px] font-bold text-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[22rem] border-zinc-800 bg-zinc-950 p-0 text-zinc-100"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-zinc-100">
            Notifications
          </DropdownMenuLabel>
          <button
            type="button"
            disabled={unreadCount === 0 || isMarkingAll}
            onClick={() => void handleMarkAllRead()}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100 disabled:opacity-50"
          >
            <CheckIcon className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <div className="max-h-[28rem] overflow-y-auto p-3">
          {isLoading && items.length === 0 ? (
            <p className="text-sm text-zinc-400">Loading…</p>
          ) : items.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-4 text-sm text-zinc-400">
              No notifications yet.
            </p>
          ) : (
            <div className="space-y-4">
              {unread.length > 0 ? (
                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    New
                  </p>
                  <div className="space-y-2">{unread.map(renderItem)}</div>
                </section>
              ) : null}
              {read.length > 0 ? (
                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
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
