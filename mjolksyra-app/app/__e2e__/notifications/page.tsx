"use client";

import { NavigationNotifications } from "@/components/Navigation/NavigationNotifications";
import { AuthContext, type AuthContextValue } from "@/context/Auth/Auth";

const mockAuth: AuthContextValue = {
  userId: "e2e-user",
  name: "E2E User",
  email: "e2e@example.com",
  givenName: "E2E",
  familyName: "User",
  isAuthenticated: true,
  login() {},
  logout() {},
  getAccessToken: async () => null,
};

export default function NotificationsE2EPage() {
  return (
    <AuthContext.Provider value={mockAuth}>
      <div className="min-h-screen overflow-y-auto bg-black p-8 text-zinc-100">
        <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              E2E Harness
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Notifications</h1>
          </div>

          <div className="flex items-center justify-end">
            <NavigationNotifications />
          </div>

          <p className="text-sm text-zinc-400">
            Open the bell menu to verify unread highlighting and read actions.
          </p>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
