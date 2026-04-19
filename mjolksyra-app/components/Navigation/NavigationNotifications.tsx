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
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

type NavigationNotificationsProps = {
  forceVisible?: boolean;
};

export function NavigationNotifications({
  forceVisible = false,
}: NavigationNotificationsProps) {
  const dropdownVars = {
    "--shell-surface": "var(--shell-surface, #ffffff)",
    "--shell-surface-strong": "var(--shell-surface-strong, #e8e9ea)",
    "--shell-border": "var(--shell-border, #d0d0d0)",
    "--shell-ink": "var(--shell-ink, #1b1b1b)",
    "--shell-muted": "var(--shell-muted, #767676)",
    "--shell-accent": "var(--shell-accent, #333333)",
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
  const formattedDates = useMemo(
    () =>
      new Map(
        items.map((x) => [
          x.id,
          formatDistanceToNow(new Date(x.createdAt), { addSuffix: true }),
        ]),
      ),
    [items],
  );

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
      setItems((prev) =>
        prev.map((x) => ({ ...x, readAt: x.readAt ?? new Date() })),
      );
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
          "px-4 py-3 transition hover:bg-[var(--shell-surface-strong)]",
          !item.readAt && "bg-[var(--shell-surface-strong)]",
        )}
      >
        <div
          className={cn(
            "min-w-0",
            !item.readAt
              ? "border-l-2 border-[var(--shell-accent)] pl-3"
              : "pl-0",
          )}
        >
          <p
            className={cn(
              "text-sm leading-snug",
              item.readAt
                ? "text-[var(--shell-muted)]"
                : "font-semibold text-[var(--shell-ink)]",
            )}
          >
            {item.title}
          </p>
          {item.body ? (
            <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
              {item.body}
            </p>
          ) : null}
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
            {formattedDates.get(item.id)}
          </p>
        </div>
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
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative size-10 rounded-none",
            open
              ? "bg-[var(--shell-ink)] text-[var(--shell-surface)] hover:bg-[var(--shell-ink)]"
              : "",
          )}
          aria-label="Open notifications"
        >
          <BellIcon
            className={cn(
              "size-4 origin-top",
              showBellRing ? "animate-bell-ring" : "",
            )}
            data-icon
          />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-none bg-[var(--shell-accent)]/40",
                  showArrivalPulse ? "animate-ping" : "opacity-0",
                )}
              />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-none border border-transparent bg-[var(--shell-accent)]" />
            </span>
          ) : null}
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-none border bg-[var(--shell-ink)] px-1.5 text-[10px] font-bold text-[var(--shell-surface)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        style={dropdownVars}
        className="w-80 overflow-hidden rounded-none border bg-[var(--shell-surface)] p-0 text-[var(--shell-ink)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <DropdownMenuLabel className="p-0 text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
            Notifications
          </DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            disabled={unreadCount === 0 || isMarkingAll}
            onClick={() => void handleMarkAllRead()}
            className="h-auto rounded-none px-0 py-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] hover:bg-transparent hover:text-[var(--shell-ink)]"
          >
            Mark all read
          </Button>
        </div>

        {/* Body */}
        <ScrollArea className="max-h-[28rem]">
          {isLoading && items.length === 0 ? (
            <div className="flex flex-col gap-3 px-4 py-4">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-3 w-48" />
              <div className="skeleton h-3 w-40" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[var(--shell-muted)]">
                No notifications yet.
              </p>
            </div>
          ) : (
            <>
              {unread.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">
                    New
                  </p>
                  <ul className="divide-y">{unread.map(renderItem)}</ul>
                </>
              )}
              {read.length > 0 && (
                <>
                  <p
                    className={cn(
                      "px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]",
                      unread.length > 0 ? "border-t pt-3 mt-1" : "pt-3",
                    )}
                  >
                    Earlier
                  </p>
                  <ul className="divide-y">{read.map(renderItem)}</ul>
                </>
              )}
            </>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
