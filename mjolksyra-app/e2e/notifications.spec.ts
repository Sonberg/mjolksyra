import { test, expect } from "@playwright/test";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  createdAt: string;
  readAt: string | null;
};

test.describe("notifications", () => {
  test("shows unread badge and groups new vs earlier notifications", async ({
    page,
  }) => {
    let notifications: NotificationItem[] = [
      {
        id: "n1",
        type: "invite.sent",
        title: "Invitation sent",
        body: "Sent invite to athlete@example.com for 1000 SEK/mo.",
        href: "/app/coach/athletes",
        createdAt: new Date().toISOString(),
        readAt: null,
      },
      {
        id: "n2",
        type: "billing.payment-succeeded",
        title: "Athlete payment succeeded",
        body: "Per Sonberg payment of 1000 SEK succeeded.",
        href: "/app/coach/athletes",
        createdAt: new Date(Date.now() - 60_000).toISOString(),
        readAt: new Date(Date.now() - 30_000).toISOString(),
      },
    ];

    await page.route("**/api/events/hub/negotiate**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          connectionId: "e2e-conn",
          connectionToken: "e2e-token",
          negotiateVersion: 1,
          availableTransports: [
            {
              transport: "LongPolling",
              transferFormats: ["Text", "Binary"],
            },
          ],
        }),
      });
    });
    await page.route(/.*\/api\/events\/hub(\?.*)?$/, async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
        return;
      }

      await route.fulfill({ status: 202, body: "" });
    });

    await page.route("**/api/notifications/read-all", async (route) => {
      notifications = notifications.map((x) => ({
        ...x,
        readAt: x.readAt ?? new Date().toISOString(),
      }));
      await route.fulfill({ status: 204, body: "" });
    });

    await page.route(/.*\/api\/notifications\/[^/]+\/read$/, async (route) => {
      const match = route.request().url().match(/\/api\/notifications\/([^/]+)\/read$/);
      const id = match?.[1];
      notifications = notifications.map((x) =>
        x.id === id ? { ...x, readAt: x.readAt ?? new Date().toISOString() } : x,
      );
      await route.fulfill({ status: 204, body: "" });
    });

    await page.route(/.*\/api\/notifications(\?.*)?$/, async (route) => {
      const unreadCount = notifications.filter((x) => !x.readAt).length;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          unreadCount,
          items: notifications,
        }),
      });
    });

    const response = await page.goto("/__e2e__/notifications");
    expect(response?.ok()).toBeTruthy();

    const bell = page.getByRole("button", { name: /open notifications/i });
    await expect(bell).toBeVisible();
    await expect(bell).toContainText("1");

    await bell.click();

    await expect(page.getByText("Notifications")).toBeVisible();
    await expect(page.getByText("New")).toBeVisible();
    await expect(page.getByText("Earlier")).toBeVisible();
    await expect(page.getByText("Invitation sent")).toBeVisible();
    await expect(page.getByText("Athlete payment succeeded")).toBeVisible();
  });

  test("marks notifications as read (single and all)", async ({ page }) => {
    let notifications: NotificationItem[] = [
      {
        id: "n1",
        type: "billing.payment-failed",
        title: "Payment failed",
        body: "Your coaching payment failed. Update your payment method to continue.",
        href: null,
        createdAt: new Date().toISOString(),
        readAt: null,
      },
      {
        id: "n2",
        type: "coach.stripe-status",
        title: "Stripe account status updated",
        body: "Onboarding completed",
        href: null,
        createdAt: new Date(Date.now() - 10_000).toISOString(),
        readAt: null,
      },
    ];

    await page.route("**/api/events/hub/negotiate**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          connectionId: "e2e-conn",
          connectionToken: "e2e-token",
          negotiateVersion: 1,
          availableTransports: [
            {
              transport: "LongPolling",
              transferFormats: ["Text", "Binary"],
            },
          ],
        }),
      });
    });
    await page.route(/.*\/api\/events\/hub(\?.*)?$/, async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
        return;
      }

      await route.fulfill({ status: 202, body: "" });
    });

    await page.route("**/api/notifications/read-all", async (route) => {
      notifications = notifications.map((x) => ({
        ...x,
        readAt: x.readAt ?? new Date().toISOString(),
      }));
      await route.fulfill({ status: 204, body: "" });
    });

    await page.route(/.*\/api\/notifications\/[^/]+\/read$/, async (route) => {
      const match = route.request().url().match(/\/api\/notifications\/([^/]+)\/read$/);
      const id = match?.[1];
      notifications = notifications.map((x) =>
        x.id === id ? { ...x, readAt: x.readAt ?? new Date().toISOString() } : x,
      );
      await route.fulfill({ status: 204, body: "" });
    });

    await page.route(/.*\/api\/notifications(\?.*)?$/, async (route) => {
      const unreadCount = notifications.filter((x) => !x.readAt).length;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount, items: notifications }),
      });
    });

    await page.goto("/__e2e__/notifications");

    const bell = page.getByRole("button", { name: /open notifications/i });
    await bell.click();

    await expect(bell).toContainText("2");
    await page.getByRole("button", { name: /payment failed/i }).click();
    await expect(bell).toContainText("1");

    await page.getByRole("button", { name: /mark all read/i }).click();
    await expect(bell).not.toContainText("1");
    await expect(bell).not.toContainText("2");

    await expect(page.getByText("New")).not.toBeVisible();
    await expect(page.getByText("Earlier")).toBeVisible();
  });
});
